import {
  BadRequestException,
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as busboy from 'busboy';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { ObjectId } from 'bson';
import { FileStreamConfigService } from './file-stream-config.service';
import { streamProblem } from './stream-upload.exceptions';
import { STREAM_UPLOAD_LOG_CONTEXT } from './stream-upload.constants';

export interface LargeUploadStagePayload {
  uploadId: string;
  chunkIndex: number;
  stagedPath: string;
  bytesWritten: number;
}

@Injectable()
export class BusboyChunkInterceptor implements NestInterceptor {
  private readonly logger = new Logger(STREAM_UPLOAD_LOG_CONTEXT);

  constructor(private readonly streamConfig: FileStreamConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    return from(this.parseMultipart(req)).pipe(mergeMap(() => next.handle()));
  }

  private async parseMultipart(req: Request): Promise<void> {
    const contentTypeHeader = req.headers['content-type'];
    if (
      typeof contentTypeHeader !== 'string' ||
      !contentTypeHeader.toLowerCase().includes('multipart/form-data')
    ) {
      throw streamProblem('STREAM_INVALID_MULTIPART');
    }

    await new Promise<void>((resolve, reject) => {
      let uploadId: string | undefined;
      let chunkIndexRaw: string | undefined;
      let gotFile = false;
      let settled = false;

      const safeResolve = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const safeReject = (err: unknown) => {
        if (settled) return;
        settled = true;
        reject(err);
      };

      const bb = busboy({
        headers: req.headers,
        limits: {
          files: 1,
          fields: 10,
          fieldSize: 256,
          fileSize: this.streamConfig.maxChunkBytes,
        },
      });

      bb.on('field', (fieldname: string, value: string) => {
        const v = typeof value === 'string' ? value.trim() : String(value).trim();
        if (fieldname === 'uploadId') {
          uploadId = v;
        } else if (fieldname === 'chunkIndex') {
          chunkIndexRaw = v;
        }
      });

      bb.on('file', (_fieldname: string, file: Readable) => {
        if (gotFile) {
          file.resume();
          safeReject(streamProblem('STREAM_INVALID_MULTIPART'));
          return;
        }
        gotFile = true;

        (async () => {
          let stagedPath: string | undefined;
          try {
            const idOk = uploadId && ObjectId.isValid(uploadId);
            const ix = chunkIndexRaw === undefined ? NaN : parseInt(chunkIndexRaw, 10);
            if (!idOk || !Number.isFinite(ix) || ix < 0) {
              file.resume();
              safeReject(streamProblem('STREAM_INVALID_MULTIPART'));
              return;
            }

            const stageRoot = path.join(this.streamConfig.tempRootAbs, '_stage');
            await fs.mkdir(stageRoot, { recursive: true, mode: 0o700 });
            stagedPath = path.join(
              stageRoot,
              `${uploadId}_${ix}_${randomUUID()}.part`,
            );

            const ws = createWriteStream(stagedPath, { flags: 'wx', mode: 0o600 });
            let truncated = false;

            file.on('limit', () => {
              truncated = true;
            });

            try {
              await pipeline(file, ws);
            } catch (pipeErr) {
              await fs.unlink(stagedPath).catch(() => undefined);
              if (truncated) {
                safeReject(streamProblem('STREAM_CHUNK_TOO_LARGE'));
                return;
              }
              safeReject(pipeErr);
              return;
            }

            if (truncated) {
              await fs.unlink(stagedPath).catch(() => undefined);
              safeReject(streamProblem('STREAM_CHUNK_TOO_LARGE'));
              return;
            }

            const stat = await fs.stat(stagedPath);

            (req as Request & { largeUploadStage?: LargeUploadStagePayload }).largeUploadStage = {
              uploadId: uploadId as string,
              chunkIndex: ix,
              stagedPath,
              bytesWritten: stat.size,
            };

            this.logger.log(
              JSON.stringify({
                msg: 'chunk_received',
                uploadId,
                chunkIndex: ix,
                bytesWritten: stat.size,
              }),
            );

            safeResolve();
          } catch (e) {
            if (stagedPath) {
              await fs.unlink(stagedPath).catch(() => undefined);
            }
            safeReject(e);
          }
        })();
      });

      bb.on('finish', () => {
        setImmediate(() => {
          if (settled) return;
          if (!gotFile) {
            safeReject(streamProblem('STREAM_INVALID_MULTIPART'));
          }
        });
      });

      bb.on('error', (err) => {
        safeReject(err ?? new BadRequestException('Malformed multipart'));
      });

      req.pipe(bb);
    });

    const stage = (req as Request & { largeUploadStage?: LargeUploadStagePayload })
      .largeUploadStage;
    if (!stage?.stagedPath) {
      throw streamProblem('STREAM_INVALID_MULTIPART');
    }
  }
}
