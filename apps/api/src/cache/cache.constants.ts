export const CACHEABLE_METADATA = Symbol('CACHEABLE_METADATA');
export const INVALIDATE_CACHE_METADATA = Symbol('INVALIDATE_CACHE_METADATA');

/** Redis key namespace prefix */
export const CACHE_KEY_PREFIX = 'cache:';

/** Stampede lock TTL (seconds) */
export const CACHE_LOCK_TTL_SEC = 10;

/** Brief pause before retry after lock contention (ms) */
export const CACHE_LOCK_RETRY_MS = 25;
