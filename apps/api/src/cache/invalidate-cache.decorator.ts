import { SetMetadata } from '@nestjs/common';
import { INVALIDATE_CACHE_METADATA } from './cache.constants';

/**
 * After a successful mutating handler, delete cached GET entries matching these patterns.
 * Pattern format: `METHOD:pathGlob`, e.g. `GET:/products*`, `GET:/users/*`
 * Paths are resolved against the API global prefix (default `/v1`).
 */
export const InvalidateCache = (patterns: string[]) =>
  SetMetadata(INVALIDATE_CACHE_METADATA, patterns);
