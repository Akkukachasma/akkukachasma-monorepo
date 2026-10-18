import { SetMetadata } from '@nestjs/common';
import { CACHEABLE_METADATA } from './cache.constants';

export type CacheableScope = 'public' | 'user';

export interface CacheableOptions {
  /** Seconds until expiry (default 60) */
  ttl?: number;
  /** Replaces the path segment in the cache key when set */
  key?: string;
  /** public: shared across users; user: per authenticated user */
  scope?: CacheableScope;
}

export const Cacheable = (options?: CacheableOptions) =>
  SetMetadata(CACHEABLE_METADATA, {
    ttl: options?.ttl ?? 60,
    scope: options?.scope ?? 'public',
    ...(options?.key !== undefined ? { key: options.key } : {}),
  });
