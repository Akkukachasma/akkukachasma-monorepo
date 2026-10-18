import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PublicApi } from './auth/decorators/public.decorator';

@ApiTags('Api Server')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @PublicApi()
  @ApiOperation({
    summary:
      'API root: system health (server, database, Redis cache) plus uptime metadata',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'System health information retrieved successfully',
  })
  @SwaggerResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'One or more system components are unhealthy',
  })
  async getServerHealth(): Promise<ApiResponse> {
    const server = this.appService.serverHealth();
    const database = await this.appService.databaseHealth();
    const cache = await this.appService.redisCacheHealth();

    const timestamp = new Date().toISOString();
    const environment =
      this.config.get<string>('DEV_ENVIRONMENT') === 'true'
        ? 'development'
        : 'production';

    const allHealthy = [server, database, cache].every(
      (service) => service.status === 'healthy',
    );
    const anyUnhealthy = [server, database, cache].some(
      (service) => service.status === 'unhealthy',
    );

    const overallStatus = anyUnhealthy
      ? 'unhealthy'
      : allHealthy
        ? 'healthy'
        : 'degraded';

    return {
      success: overallStatus !== 'unhealthy',
      message: `System status: ${overallStatus}`,
      data: {
        status: overallStatus,
        timestamp,
        environment,
        server,
        database,
        cache,
      },
    };
  }
}
