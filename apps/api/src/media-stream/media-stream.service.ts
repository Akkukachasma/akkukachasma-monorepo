import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { pipeline } from 'stream/promises';
import type { Readable } from 'stream';
import { BucketService } from '../bucket/bucket.service';
import {
  parseByteRangeHeader,
  s3RangeHeader,
} from './http-byte-range.util';

function isBenignClientStreamAbort(err: unknown): boolean {
  const e = err as NodeJS.ErrnoException & Error;
  if (e?.code === 'ERR_STREAM_PREMATURE_CLOSE') return true;
  if (e?.code === 'ECONNRESET' || e?.code === 'EPIPE') return true;
  if (e?.name === 'AbortError') return true;
  const msg = String(e?.message ?? err ?? '').toLowerCase();
  if (msg === 'aborted' || msg.includes('abort')) return true;
  return false;
}

export type PipeFileStreamOptions = {
  req: Request;
  res: Response;
  storageKey: string;
  fileId: string;
  contentType?: string | null;
  logContext: string;
  errorType: string;
  notFoundCode?: string;
  notFoundMessage?: string;
};

@Injectable()
export class MediaStreamService {
  private readonly logger = new Logger(MediaStreamService.name);

  constructor(private readonly bucket: BucketService) {}

  async pipeObjectToResponse(opts: PipeFileStreamOptions): Promise<void> {
    const t0 = Date.now();
    const {
      req,
      res,
      storageKey,
      fileId,
      contentType,
      logContext,
      errorType,
      notFoundCode = 'MEDIA_NOT_FOUND',
      notFoundMessage = 'Media file not found.',
    } = opts;

    let head: Awaited<ReturnType<BucketService['headObject']>>;
    try {
      head = await this.bucket.headObject(storageKey);
    } catch (e: unknown) {
      this.logger.error(
        JSON.stringify({
          msg: 'stream_head_failed',
          logContext,
          fileId,
          key: storageKey,
          error: String((e as Error)?.message ?? e),
        }),
      );
      res.status(503).json({
        success: false,
        message: 'Media storage unavailable.',
        type: errorType,
        code: 'MEDIA_STREAM_STORAGE_ERROR',
      });
      return;
    }

    const size = Number(head.ContentLength ?? 0);
    const etag = head.ETag ?? `"${fileId}"`;
    const resolvedType =
      contentType ?? head.ContentType ?? 'application/octet-stream';

    const rangeParse = parseByteRangeHeader(
      req.headers.range as string | undefined,
      size,
    );

    this.logger.log(
      JSON.stringify({
        msg: 'stream_started',
        logContext,
        fileId,
        rangeHeader: req.headers.range ?? null,
        parse: rangeParse.kind,
        size,
        elapsedMs: Date.now() - t0,
      }),
    );

    if (rangeParse.kind === 'malformed') {
      res.status(400).json({
        success: false,
        message: 'Invalid Range header.',
        type: errorType,
        code: 'MEDIA_RANGE_MALFORMED',
      });
      return;
    }

    if (rangeParse.kind === 'unsatisfiable') {
      res.status(416);
      res.setHeader('Content-Range', `bytes */${size}`);
      res.end();
      return;
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800',
    );
    res.setHeader('ETag', etag);
    if (head.LastModified) {
      res.setHeader('Last-Modified', head.LastModified.toUTCString());
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');

    let s3Range: string | undefined;
    let status: 200 | 206 = 200;
    if (rangeParse.kind === 'partial') {
      s3Range = s3RangeHeader(rangeParse.start, rangeParse.end);
      status = 206;
    }

    let obj: Awaited<ReturnType<BucketService['getObjectStream']>>;
    try {
      obj = await this.bucket.getObjectStream(storageKey, s3Range);
    } catch (e: unknown) {
      this.logger.error(
        JSON.stringify({
          msg: 'stream_get_object_failed',
          logContext,
          fileId,
          range: s3Range ?? null,
          error: String((e as Error)?.message ?? e),
        }),
      );
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: notFoundMessage,
          type: errorType,
          code: notFoundCode,
        });
      }
      return;
    }

    res.status(status);
    res.setHeader('Content-Type', resolvedType);
    if (obj.ContentLength != null) {
      res.setHeader('Content-Length', String(obj.ContentLength));
    }
    if (obj.ContentRange) {
      res.setHeader('Content-Range', String(obj.ContentRange));
    }
    if (obj.ETag) {
      res.setHeader('ETag', String(obj.ETag));
    }

    const body = obj.Body as Readable | undefined;
    if (!body) {
      res.status(500).end();
      return;
    }

    try {
      await pipeline(body, res);
      this.logger.log(
        JSON.stringify({
          msg: 'stream_completed',
          logContext,
          fileId,
          status,
          elapsedMs: Date.now() - t0,
        }),
      );
    } catch (err: unknown) {
      if (isBenignClientStreamAbort(err)) {
        this.logger.debug(
          JSON.stringify({
            msg: 'stream_aborted_by_client',
            logContext,
            fileId,
          }),
        );
        return;
      }
      this.logger.error(
        JSON.stringify({
          msg: 'stream_pipeline_failed',
          logContext,
          fileId,
          error: String((err as Error)?.message ?? err),
        }),
      );
    }
  }
}
