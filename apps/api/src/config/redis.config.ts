import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
  /**
   * Legacy toggle; prefer CACHE_ENABLED. When both unset, cache is off (rakritech default).
   */
  cacheEnabled: process.env.CACHE_REDIS_ENABLED !== 'false',
}));
