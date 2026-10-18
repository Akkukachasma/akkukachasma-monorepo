import { CacheService } from '../cache/cache.service';

export function createMockCacheService(): Partial<CacheService> {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    delByPattern: jest.fn().mockResolvedValue(0),
    invalidate: jest.fn().mockResolvedValue(undefined),
    invalidateByPrefix: jest.fn().mockResolvedValue(undefined),
    isReady: jest.fn().mockReturnValue(false),
    isClientEnabled: jest.fn().mockReturnValue(false),
    acquireLock: jest.fn().mockResolvedValue(true),
    releaseLock: jest.fn().mockResolvedValue(undefined),
    fullKeySegment: jest.fn((method: string, path: string) => `cache:${method}:${path}`),
    lockKeyFor: jest.fn((key: string) => `lock:cache:${key}`),
  };
}
