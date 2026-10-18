import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from './cache.interceptor';
import { CacheService } from './cache.service';

@Module({
  providers: [
    CacheService,
    CacheInterceptor,
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
  exports: [CacheService],
})
export class CacheModule {}
