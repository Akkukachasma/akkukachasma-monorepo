import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { Observable, from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import {
  CACHE_LOCK_RETRY_MS,
  CACHEABLE_METADATA,
  INVALIDATE_CACHE_METADATA,
} from './cache.constants';
import type { CacheableOptions } from './cache.decorator';
import { CacheService } from './cache.service';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function stableQueryHash(query: Record<string, unknown>): string {
  const keys = Object.keys(query).sort();
  const pairs = keys.map((k) => [k, query[k]] as const);
  return createHash('sha256').update(JSON.stringify(pairs)).digest('hex').slice(0, 16);
}

/** Strip Express-style `:param` segments from invalidate patterns into Redis globs */
function expandInvalidatePathGlob(pathGlob: string): string {
  return pathGlob.replace(/:[^/*]+/g, '*');
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
    private readonly config: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const method = (request.method ?? 'GET').toUpperCase();

    const handler = context.getHandler();
    const controllerClass = context.getClass();

    const cacheOpts = this.reflector.getAllAndOverride<CacheableOptions | undefined>(
      CACHEABLE_METADATA,
      [handler, controllerClass],
    );

    const invalidatePatterns = this.reflector.getAllAndOverride<string[] | undefined>(
      INVALIDATE_CACHE_METADATA,
      [handler, controllerClass],
    );

    const hasInvalidate =
      Array.isArray(invalidatePatterns) && invalidatePatterns.length > 0;

    if (!cacheOpts && !hasInvalidate) {
      return next.handle();
    }

    const bypassRaw = normalizeHeader(request.headers['x-cache-bypass']);
    const bypass =
      bypassRaw === '1' ||
      String(bypassRaw ?? '').toLowerCase() === 'true';

    const debugRaw = normalizeHeader(request.headers['x-cache-debug']);
    const debug =
      debugRaw === '1' ||
      String(debugRaw ?? '').toLowerCase() === 'true';

    const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (mutating && hasInvalidate) {
      const redisPatterns = this.toRedisPatterns(invalidatePatterns!);
      return next.handle().pipe(
        mergeMap(async (body) => {
          await this.runInvalidatePatterns(redisPatterns);
          return body;
        }),
      );
    }

    if (method !== 'GET' || !cacheOpts) {
      return next.handle();
    }

    if (bypass) {
      return next.handle();
    }

    if (!this.cacheService.isReady()) {
      return next.handle();
    }

    const globalPrefix = this.config.get<string>('GLOBAL_PREFIX') ?? '/v1';
    const pathOnly =
      (request.originalUrl ?? request.url ?? '').split('?')[0] ?? '';
    const normalizedPath = pathOnly.startsWith(globalPrefix)
      ? pathOnly
      : `${globalPrefix}${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}`;

    const pathSegment = cacheOpts.key ?? normalizedPath;
    const queryHash = stableQueryHash(
      (request.query ?? {}) as Record<string, unknown>,
    );

    let scopeSegment: string;
    if (cacheOpts.scope === 'user') {
      const userId = this.extractUserId(request);
      if (userId === undefined) {
        return next.handle();
      }
      scopeSegment = `user:${userId}`;
    } else {
      scopeSegment = 'public';
    }

    const cacheKey = `${this.cacheService.fullKeySegment(method, pathSegment)}:${scopeSegment}:${queryHash}`;
    const lockKey = this.cacheService.lockKeyFor(cacheKey);

    return from(this.tryCacheGet(cacheKey)).pipe(
      mergeMap((hit) => {
        if (hit !== undefined) {
          if (debug) response.setHeader('X-Cache', 'HIT');
          return of(hit);
        }
        if (debug) response.setHeader('X-Cache', 'MISS');

        let acquiredLock = false;
        return from(
          (async () => {
            acquiredLock = await this.cacheService.acquireLock(lockKey);
            if (!acquiredLock) {
              await delay(CACHE_LOCK_RETRY_MS);
              const retry = await this.cacheService.get<unknown>(cacheKey);
              if (retry !== null) {
                if (debug) response.setHeader('X-Cache', 'HIT');
                this.cacheService.cacheHitLog(cacheKey);
                return { skipHandler: true as const, body: retry };
              }
            }
            return { skipHandler: false as const, acquiredLock };
          })(),
        ).pipe(
          mergeMap((pre) => {
            if (pre.skipHandler) {
              return of(pre.body);
            }
            acquiredLock = pre.acquiredLock;
            return next.handle().pipe(
              mergeMap((body) =>
                from(
                  (async () => {
                    const ttl = cacheOpts.ttl ?? 60;
                    await this.cacheService.set(cacheKey, body, ttl);
                    this.cacheService.cacheMissLog(cacheKey);
                    if (acquiredLock) await this.cacheService.releaseLock(lockKey);
                    return body;
                  })(),
                ),
              ),
              catchError((err: unknown) => {
                if (acquiredLock) void this.cacheService.releaseLock(lockKey);
                throw err;
              }),
            );
          }),
        );
      }),
    );
  }

  private extractUserId(request: Request): string | undefined {
    const user = request['user'] as { id?: string } | undefined;
    const id = user?.id;
    return typeof id === 'string' ? id : undefined;
  }

  private async tryCacheGet(cacheKey: string): Promise<unknown | undefined> {
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached !== null) {
      this.cacheService.cacheHitLog(cacheKey);
      return cached;
    }
    return undefined;
  }

  private toRedisPatterns(patterns: string[]): string[] {
    const globalPrefix = this.config.get<string>('GLOBAL_PREFIX') ?? '/v1';
    return patterns.map((p) => this.patternToRedisGlob(p, globalPrefix));
  }

  /**
   * `GET:/products*` → `cache:GET:/v1/products*`
   */
  private patternToRedisGlob(pattern: string, globalPrefix: string): string {
    const colon = pattern.indexOf(':');
    if (colon <= 0) {
      return this.patternToRedisGlob(`GET:${pattern}`, globalPrefix);
    }
    const httpMethod = pattern.slice(0, colon).toUpperCase();
    let pathGlob = expandInvalidatePathGlob(pattern.slice(colon + 1));

    if (!pathGlob.startsWith(globalPrefix)) {
      const slash = pathGlob.startsWith('/') ? '' : '/';
      pathGlob = `${globalPrefix}${slash}${pathGlob}`;
    }

    const pathWithTrailingGlob = pathGlob.endsWith('*')
      ? pathGlob
      : `${pathGlob}*`;

    return `${this.cacheService.fullKeySegment(httpMethod, pathWithTrailingGlob)}`;
  }

  private async runInvalidatePatterns(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      const removed = await this.cacheService.delByPattern(pattern);
      this.cacheService.invalidationLog(pattern, removed);
    }
  }
}
