import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CACHE_KEY_PREFIX, CACHE_LOCK_TTL_SEC } from './cache.constants';

const LOCK_PREFIX = 'lock:cache:';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private readonly enabled: boolean;
  private readonly devLogging: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = this.resolveCacheEnabled();
    const nodeEnv = this.config.get<string>('NODE_ENV');
    this.devLogging = nodeEnv !== 'production';
  }

  /** Supports CACHE_ENABLED (rakritech) and legacy CACHE_REDIS_ENABLED. */
  private resolveCacheEnabled(): boolean {
    const explicit = this.config.get<string>('CACHE_ENABLED');
    if (explicit !== undefined && explicit !== '') {
      return String(explicit).toLowerCase() !== 'false';
    }
    const legacy = this.config.get<string>('CACHE_REDIS_ENABLED');
    if (legacy !== undefined && legacy !== '') {
      return String(legacy).toLowerCase() !== 'false';
    }
    return false;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.log(
        'HTTP cache disabled (set CACHE_ENABLED=true or CACHE_REDIS_ENABLED=true to enable)',
      );
      return;
    }

    const url = this.config.get<string>('REDIS_URL');
    const host = this.config.get<string>('REDIS_HOST') ?? '127.0.0.1';
    const port = Number(this.config.get<string>('REDIS_PORT') ?? '6379');
    const password = this.config.get<string>('REDIS_PASSWORD');
    const db = this.config.get<string>('REDIS_DB');
    const dbNum =
      db !== undefined && db !== '' ? Number.parseInt(db, 10) : undefined;

    try {
      const redisOptions = {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        retryStrategy: (times: number) =>
          times > 3 ? null : Math.min(times * 200, 2000),
      };

      this.client = url
        ? new Redis(url, redisOptions)
        : new Redis({
            host,
            port,
            password: password || undefined,
            ...(Number.isFinite(dbNum) ? { db: dbNum } : {}),
            ...redisOptions,
          });

      this.client.on('error', (err: Error) => {
        this.logger.warn(`Redis error (cache degraded): ${err.message}`);
      });

      void this.client.connect().catch((err: Error) => {
        this.logger.warn(
          `Redis connection failed (cache disabled): ${err.message}`,
        );
        void this.safeQuit();
        this.client = null;
      });
    } catch (err) {
      this.logger.warn(
        `Redis setup failed (cache disabled): ${err instanceof Error ? err.message : err}`,
      );
      this.client = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.safeQuit();
  }

  isReady(): boolean {
    return this.enabled && this.client !== null && this.client.status === 'ready';
  }

  /** @deprecated Use isReady() */
  isClientEnabled(): boolean {
    return this.isReady();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isReady()) return null;
    try {
      const raw = await this.client!.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(
        `cache get failed: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    if (!this.isReady()) return;
    try {
      const payload = JSON.stringify(value);
      if (ttlSec !== undefined && ttlSec > 0) {
        await this.client!.setex(key, ttlSec, payload);
      } else {
        await this.client!.set(key, payload);
      }
    } catch (err) {
      this.logger.warn(
        `cache set failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady()) return;
    try {
      await this.client!.del(key);
    } catch (err) {
      this.logger.warn(
        `cache del failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  /** @deprecated Use del() */
  async invalidate(...keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.del(key);
    }
  }

  /**
   * Deletes keys matching a Redis glob-style pattern under SCAN (non-blocking batches).
   */
  async delByPattern(pattern: string): Promise<number> {
    if (!this.isReady()) return 0;
    let deleted = 0;
    let cursor = '0';
    try {
      do {
        const res = await this.client!.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          128,
        );
        cursor = res[0];
        const keys = res[1];
        if (keys.length > 0) {
          deleted += await this.client!.del(...keys);
        }
      } while (cursor !== '0');
      return deleted;
    } catch (err) {
      this.logger.warn(
        `cache delByPattern failed: ${err instanceof Error ? err.message : err}`,
      );
      return deleted;
    }
  }

  /** @deprecated Use delByPattern() */
  async invalidateByPrefix(logicalPrefix: string): Promise<void> {
    await this.delByPattern(`${logicalPrefix}*`);
  }

  lockKeyFor(cacheKey: string): string {
    return `${LOCK_PREFIX}${cacheKey}`;
  }

  async acquireLock(lockKey: string): Promise<boolean> {
    if (!this.isReady()) return true;
    try {
      const ok = await this.client!.set(
        lockKey,
        '1',
        'EX',
        CACHE_LOCK_TTL_SEC,
        'NX',
      );
      return ok === 'OK';
    } catch (err) {
      this.logger.warn(
        `cache lock acquire failed: ${err instanceof Error ? err.message : err}`,
      );
      return true;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    if (!this.isReady()) return;
    try {
      await this.client!.del(lockKey);
    } catch (err) {
      this.logger.warn(
        `cache lock release failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  cacheHitLog(finalKey: string): void {
    if (this.devLogging) {
      this.logger.debug(`cache HIT ${finalKey}`);
    }
  }

  cacheMissLog(finalKey: string): void {
    if (this.devLogging) {
      this.logger.debug(`cache MISS ${finalKey}`);
    }
  }

  invalidationLog(pattern: string, count: number): void {
    if (this.devLogging) {
      this.logger.debug(`cache INVALIDATION pattern=${pattern} removed=${count}`);
    }
  }

  fullKeySegment(method: string, pathSegment: string): string {
    return `${CACHE_KEY_PREFIX}${method}:${pathSegment}`;
  }

  private async safeQuit(): Promise<void> {
    if (!this.client) return;
    try {
      if (this.client.status !== 'end') {
        await this.client.quit();
      }
    } catch {
      try {
        this.client.disconnect();
      } catch {
        /* ignore */
      }
    } finally {
      this.client = null;
    }
  }
}
