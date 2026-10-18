import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import Redis from 'ioredis';
import { PrismaService } from './prisma/prisma.service';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: Record<string, unknown>;
}

interface ErrorWithMessage {
  message: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  serverHealth(): HealthStatus {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const freeMemory = os.freemem();
      const totalMemory = os.totalmem();

      return {
        status: 'healthy',
        message: 'Server is running normally',
        details: {
          uptime: `${Math.floor(uptime / 60)} minutes, ${Math.floor(uptime % 60)} seconds`,
          memoryUsage: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          },
          systemMemory: {
            free: `${Math.round(freeMemory / 1024 / 1024)} MB`,
            total: `${Math.round(totalMemory / 1024 / 1024)} MB`,
            percentFree: `${Math.round((freeMemory / totalMemory) * 100)}%`,
          },
        },
      };
    } catch (error) {
      const err = error as ErrorWithMessage;
      return {
        status: 'unhealthy',
        message: 'Server health check failed',
        details: { error: err.message },
      };
    }
  }

  async databaseHealth(): Promise<HealthStatus> {
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      return {
        status: 'healthy',
        message: 'Database is reachable',
        details: { provider: 'mongodb' },
      };
    } catch (error) {
      const err = error as ErrorWithMessage;
      this.logger.warn(`Database health check failed: ${err.message}`);
      return {
        status: 'unhealthy',
        message: 'Failed to connect to database',
        details: { provider: 'mongodb', error: err.message },
      };
    }
  }

  /**
   * Verifies Redis is reachable using REDIS_HOST and REDIS_PORT.
   * If REDIS_HOST is unset, returns degraded (cache optional).
   */
  async redisCacheHealth(): Promise<HealthStatus> {
    const host = this.configService.get<string>('REDIS_HOST')?.trim();
    const portEnv =
      this.configService.get<string>('REDIS_PORT') ??
      String(this.configService.get<number>('REDIS_PORT') ?? '');
    const portParsed =
      portEnv && portEnv.trim() !== ''
        ? Number.parseInt(portEnv.trim(), 10)
        : 6379;
    const port =
      Number.isFinite(portParsed) && portParsed > 0 ? portParsed : 6379;

    if (!host) {
      return {
        status: 'degraded',
        message:
          'Redis cache not configured (set REDIS_HOST and REDIS_PORT to enable)',
        details: {
          provider: 'redis',
          configured: false,
        },
      };
    }

    let client: Redis | undefined;
    try {
      client = new Redis({
        host,
        port,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        commandTimeout: 3000,
        enableOfflineQueue: false,
      });

      await client.connect();
      const pong = await client.ping();
      await client.quit();

      if (pong !== 'PONG') {
        return {
          status: 'unhealthy',
          message: 'Redis responded unexpectedly to PING',
          details: {
            provider: 'redis',
            host,
            port,
            response: pong,
          },
        };
      }

      return {
        status: 'healthy',
        message: 'Redis cache is reachable',
        details: {
          provider: 'redis',
          host,
          port,
          ping: pong,
        },
      };
    } catch (error) {
      const err = error as ErrorWithMessage;
      this.logger.warn(`Redis health check failed: ${err.message}`);
      try {
        client?.disconnect();
      } catch {
        /* ignore */
      }
      return {
        status: 'unhealthy',
        message: 'Failed to connect to Redis cache',
        details: {
          provider: 'redis',
          host,
          port,
          error: err.message,
        },
      };
    }
  }
}
