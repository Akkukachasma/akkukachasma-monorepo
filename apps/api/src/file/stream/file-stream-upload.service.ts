import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStreamConfigService } from './file-stream-config.service';
import {
  sanitizeUploadSegment,
  FileStreamLocalStorageService,
} from './file-stream-local-storage.service';
import { BucketService } from '../../bucket/bucket.service';
import { FileService } from '../file.service';
import { StreamInitDto } from '../dto/stream-init.dto';
import {
  expectedChunkByteLength,
  maxChunkByteLength,
} from './stream-chunk-layout.util';
import { createSequentialChunkReadable } from './stream-merge.readable';
import {
  streamProblem,
  logStreamUpload,
  logStreamUploadError,
} from './stream-upload.exceptions';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import { STREAM_UPLOAD_LOG_CONTEXT } from './stream-upload.constants';
import { LargeUploadStagePayload } from './busboy-chunk.interceptor';
import type { Readable } from 'stream';
import { ObjectId } from 'bson';

export function sanitizeStreamFilename(raw: string): string {
  const base = raw.replace(/\\/g, '/').split('/').pop() ?? 'file';
  const cleaned = base.replace(/[^\w.\-+()[\] ]/g, '_').trim();
  return cleaned.slice(0, 180) || 'file';
}

@Injectable()
export class FileStreamUploadService {
  private readonly logger = new Logger(STREAM_UPLOAD_LOG_CONTEXT);
  private readonly chunkQueues = new Map<string, Promise<unknown>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly streamConfig: FileStreamConfigService,
    private readonly local: FileStreamLocalStorageService,
    private readonly bucket: BucketService,
    private readonly fileService: FileService,
  ) {}

  private runSerialized<T>(uploadId: string, fn: () => Promise<T>): Promise<T> {
    const tail = this.chunkQueues.get(uploadId) ?? Promise.resolve();
    const next = tail.catch(() => undefined).then(fn);
    const wrapped = next.finally(() => {
      if (this.chunkQueues.get(uploadId) === wrapped) {
        this.chunkQueues.delete(uploadId);
      }
    });
    this.chunkQueues.set(uploadId, wrapped);
    return wrapped;
  }

  async initSession(userId: string, dto: StreamInitDto) {
    const t0 = Date.now();
    const mimetypeNorm = dto.mimetype.trim().toLowerCase();
    if (!this.streamConfig.allowedMimeTypes.has(mimetypeNorm)) {
      throw streamProblem('STREAM_UNSUPPORTED_MIME');
    }
    if (dto.totalSize > this.streamConfig.maxFileBytes) {
      throw streamProblem('STREAM_BAD_TOTALS');
    }
    const maxSingle = maxChunkByteLength(dto.totalSize, dto.totalChunks);
    if (
      maxSingle > this.streamConfig.maxChunkBytes ||
      dto.totalChunks > dto.totalSize
    ) {
      throw streamProblem('STREAM_BAD_TOTALS');
    }

    const uploadId = this.local.generateNewUploadIdHex();
    const expiresAt = new Date(Date.now() + this.streamConfig.sessionTtlMs);

    await this.prisma.fileUploadSession.create({
      data: {
        id: uploadId,
        filename: sanitizeStreamFilename(dto.filename),
        mimetype: dto.mimetype,
        total_size: dto.totalSize,
        total_chunks: dto.totalChunks,
        uploaded_chunk_indices: [],
        bytes_received: 0,
        status: 'uploading',
        relative_storage_key: `uploads/${uploadId}`,
        expires_at: expiresAt,
        user_id: userId,
      },
    });

    await this.local.ensureSessionDir(uploadId);

    logStreamUpload(this.logger, {
      msg: 'upload_initiated',
      uploadId,
      filename: dto.filename,
      totalSize: dto.totalSize,
      totalChunks: dto.totalChunks,
      userId,
      elapsedMs: Date.now() - t0,
    });

    return {
      uploadId,
      expiresAt: expiresAt.toISOString(),
      maxChunkBytes: this.streamConfig.maxChunkBytes,
    };
  }

  async acceptStagedChunk(userId: string, stage: LargeUploadStagePayload) {
    return this.runSerialized(stage.uploadId, () =>
      this.acceptStagedChunkInner(userId, stage),
    );
  }

  private async acceptStagedChunkInner(
    userId: string,
    stage: LargeUploadStagePayload,
  ) {
    const t0 = Date.now();
    let stagedPath = stage.stagedPath;

    try {
      const session = await this.prisma.fileUploadSession.findUnique({
        where: { id: stage.uploadId },
      });
      if (!session) {
        throw streamProblem('STREAM_SESSION_NOT_FOUND', 404);
      }
      if (session.user_id !== userId) {
        throw streamProblem('STREAM_NOT_OWNER', 404);
      }
      if (session.expires_at < new Date()) {
        throw streamProblem('STREAM_SESSION_EXPIRED', 410);
      }
      if (
        ['completed', 'failed', 'cancelled', 'merging'].includes(session.status)
      ) {
        throw streamProblem('STREAM_INVALID_STATE');
      }
      if (stage.chunkIndex < 0 || stage.chunkIndex >= session.total_chunks) {
        throw streamProblem('STREAM_INVALID_CHUNK_INDEX');
      }

      const expectedSize = expectedChunkByteLength(
        session.total_size,
        session.total_chunks,
        stage.chunkIndex,
      );

      const st = await fs.stat(stagedPath);
      if (st.size !== expectedSize) {
        throw streamProblem('STREAM_CHUNK_SIZE_MISMATCH');
      }

      const finalPath = this.local.absoluteChunkPath(
        session.id,
        stage.chunkIndex,
      );
      await this.local.ensureSessionDir(session.id);

      let idempotentHit = false;
      const cur = await fs.stat(finalPath).catch(() => null);
      if (cur) {
        if (cur.size === expectedSize) {
          await fs.unlink(stagedPath).catch(() => undefined);
          stagedPath = undefined;
          idempotentHit = true;
        } else {
          await fs.unlink(stagedPath).catch(() => undefined);
          stagedPath = undefined;
          throw streamProblem('STREAM_DUPLICATE_CHUNK_MISMATCH');
        }
      } else {
        await fs.rename(stagedPath, finalPath);
        stagedPath = undefined;
      }

      const prevIndices = [...session.uploaded_chunk_indices];
      const hadIndexAlready = prevIndices.includes(stage.chunkIndex);

      const merged = new Set(prevIndices);
      if (!hadIndexAlready) {
        merged.add(stage.chunkIndex);
      }

      const sorted = Array.from(merged).sort((a, b) => a - b);
      const newExpires = new Date(Date.now() + this.streamConfig.sessionTtlMs);

      const dbUpdate: Prisma.FileUploadSessionUpdateInput = {
        uploaded_chunk_indices: sorted,
        status: 'uploading',
        expires_at: newExpires,
      };

      if (!hadIndexAlready) {
        dbUpdate.bytes_received = { increment: expectedSize };
      }

      await this.prisma.fileUploadSession.update({
        where: { id: session.id },
        data: dbUpdate,
      });

      const fresh = await this.prisma.fileUploadSession.findUnique({
        where: { id: session.id },
      });

      const uploadedChunks =
        fresh?.uploaded_chunk_indices?.length ?? sorted.length;

      logStreamUpload(this.logger, {
        msg:
          idempotentHit && hadIndexAlready
            ? 'chunk_skipped_idempotent'
            : 'chunk_persisted',
        uploadId: session.id,
        chunkIndex: stage.chunkIndex,
        filename: session.filename,
        expectedSize,
        idempotentReplay: idempotentHit,
        repairedDbFromDisk: idempotentHit && !hadIndexAlready,
        uploadedChunks,
        percent: Math.round(
          (100 * uploadedChunks) / Math.max(1, session.total_chunks),
        ),
        elapsedMs: Date.now() - t0,
      });

      const percentRounded = Math.round(
        (100 * uploadedChunks) / Math.max(1, session.total_chunks),
      );

      return {
        uploadId: session.id,
        uploadedChunks,
        totalChunks: session.total_chunks,
        percent: percentRounded,
        bytesReceived: fresh?.bytes_received ?? 0,
      };
    } finally {
      if (stagedPath) {
        await fs.unlink(stagedPath).catch(() => undefined);
      }
    }
  }

  async getStatus(userId: string, uploadIdRaw: string) {
    sanitizeUploadSegment(uploadIdRaw);

    const session = await this.prisma.fileUploadSession.findUnique({
      where: { id: uploadIdRaw },
    });

    if (!session) throw streamProblem('STREAM_SESSION_NOT_FOUND', 404);
    if (session.user_id !== userId) throw streamProblem('STREAM_NOT_OWNER', 404);

    const sorted = [...session.uploaded_chunk_indices].sort((a, b) => a - b);
    const uploadedChunks = new Set(sorted).size;

    logStreamUpload(this.logger, {
      msg: 'upload_status_polled',
      uploadId: session.id,
      status: session.status,
      uploadedChunks,
    });

    return {
      uploadId: session.id,
      status: session.status,
      uploadedChunkIndices: sorted,
      uploadedChunks,
      totalChunks: session.total_chunks,
      totalSize: session.total_size,
      bytesReceived: session.bytes_received,
      percent: Math.round(
        (100 * uploadedChunks) / Math.max(1, session.total_chunks),
      ),
      expiresAt: session.expires_at.toISOString(),
      resultFileId: session.result_file_id,
      failedReason: session.failed_reason,
    };
  }

  async cancel(userId: string, uploadId: string) {
    sanitizeUploadSegment(uploadId);

    const session = await this.prisma.fileUploadSession.findUnique({
      where: { id: uploadId },
    });
    if (!session) throw streamProblem('STREAM_SESSION_NOT_FOUND', 404);
    if (session.user_id !== userId) throw streamProblem('STREAM_NOT_OWNER', 404);
    if (session.status === 'completed') {
      throw streamProblem('STREAM_INVALID_STATE');
    }

    await this.prisma.fileUploadSession.update({
      where: { id: uploadId },
      data: { status: 'cancelled' },
    });
    await this.local.removeSessionDir(uploadId);

    await this.prisma.fileUploadSession.deleteMany({
      where: { id: uploadId },
    });

    logStreamUpload(this.logger, {
      msg: 'upload_cancelled',
      uploadId,
    });

    return { uploadId };
  }

  async complete(userId: string, uploadId: string) {
    sanitizeUploadSegment(uploadId);

    const mergeStarted = Date.now();

    try {
      return await this.runSerialized(uploadId, () =>
        this.completeSerialized(userId, uploadId, mergeStarted),
      );
    } catch (e) {
      logStreamUploadError(this.logger, {
        msg: 'upload_failed_outer',
        uploadId,
        error: String((e as Error)?.message ?? e),
      });
      throw e;
    }
  }

  private async completeSerialized(
    userId: string,
    uploadId: string,
    mergeStarted: number,
  ) {
    const session = await this.prisma.fileUploadSession.findUnique({
      where: { id: uploadId },
    });

    if (!session) throw streamProblem('STREAM_SESSION_NOT_FOUND', 404);
    if (session.user_id !== userId) throw streamProblem('STREAM_NOT_OWNER', 404);
    if (session.expires_at < new Date()) {
      throw streamProblem('STREAM_SESSION_EXPIRED', 410);
    }

    logStreamUpload(this.logger, {
      msg: 'merge_started',
      uploadId,
      filename: session.filename,
      totalChunks: session.total_chunks,
      totalSize: session.total_size,
    });

    if (session.status === 'completed' && session.result_file_id) {
      const fileRow = await this.fileService.getFileById(session.result_file_id);
      logStreamUpload(this.logger, {
        msg: 'complete_idempotent_already_done',
        uploadId,
        fileId: session.result_file_id,
      });
      return { success: true, data: fileRow, mergeMs: Date.now() - mergeStarted };
    }

    const unique = new Set(session.uploaded_chunk_indices);
    if (unique.size !== session.total_chunks) {
      throw streamProblem('STREAM_MISSING_CHUNKS');
    }
    for (let i = 0; i < session.total_chunks; i++) {
      if (!unique.has(i)) throw streamProblem('STREAM_MISSING_CHUNKS');
    }

    const paths: string[] = [];
    for (let i = 0; i < session.total_chunks; i++) {
      const chunkPath = this.local.absoluteChunkPath(uploadId, i);
      paths.push(chunkPath);
      let st;
      try {
        st = await fs.stat(chunkPath);
      } catch {
        throw streamProblem('STREAM_MISSING_CHUNKS');
      }
      const exp = expectedChunkByteLength(
        session.total_size,
        session.total_chunks,
        i,
      );
      if (st.size !== exp) {
        throw streamProblem('STREAM_CHUNK_SIZE_MISMATCH');
      }
    }

    const claim = await this.prisma.fileUploadSession.updateMany({
      where: {
        id: uploadId,
        user_id: userId,
        status: { in: ['uploading', 'initiated'] },
      },
      data: { status: 'merging' },
    });

    if (claim.count === 0) {
      const again = await this.prisma.fileUploadSession.findUnique({
        where: { id: uploadId },
      });
      if (again?.status === 'completed' && again.result_file_id) {
        const fileRow = await this.fileService.getFileById(again.result_file_id);
        return {
          success: true,
          data: fileRow,
          mergeMs: Date.now() - mergeStarted,
        };
      }
      if (again?.status === 'merging') {
        throw streamProblem('STREAM_MERGE_RACE', 409);
      }
      throw streamProblem('STREAM_INVALID_STATE');
    }

    const safeName = sanitizeStreamFilename(session.filename);

    let mergeReadable: Readable | null =
      createSequentialChunkReadable(paths);
    let uploadedKey: string | null = null;

    try {
      const key = this.bucket.streamUploadKey(safeName);

      logStreamUpload(this.logger, {
        msg: 'bucket_upload_started',
        uploadId,
        key,
      });

      const uploaded = await this.bucket.uploadReadableStream({
        key,
        body: mergeReadable,
        contentType: session.mimetype,
        contentDisposition: 'inline',
        isPublic: true,
      });
      uploadedKey = uploaded.key;
      mergeReadable = null;

      logStreamUpload(this.logger, {
        msg: 'bucket_upload_completed',
        uploadId,
        key: uploaded.key,
        elapsedMs: Date.now() - mergeStarted,
      });

      const filePayload = await this.prisma.$transaction(async (tx) => {
        const created = await this.fileService.createFile({
          file: {
            key: uploaded.key,
            url: uploaded.url,
            type: session.mimetype,
            fieldname: session.filename,
            is_temp: true,
          },
          createRelationInput: {},
          prisma: tx,
        });
        await tx.fileUploadSession.update({
          where: { id: uploadId },
          data: {
            status: 'completed',
            completed_at: new Date(),
            result_file_id: created.id,
          },
        });
        return created;
      });

      await this.local.removeSessionDir(uploadId);

      logStreamUpload(this.logger, {
        msg: 'merge_completed',
        uploadId,
        fileId: filePayload.id,
        mergeMs: Date.now() - mergeStarted,
      });

      return {
        success: true,
        data: filePayload,
        mergeMs: Date.now() - mergeStarted,
      };
    } catch (err: any) {
      if (mergeReadable) {
        try {
          mergeReadable.destroy();
        } catch {
          /* ignore */
        }
      }

      await this.prisma.fileUploadSession
        .update({
          where: { id: uploadId },
          data: {
            status: 'failed',
            failed_reason: String(err?.message ?? err ?? 'UNKNOWN'),
          },
        })
        .catch(() => undefined);

      if (uploadedKey) {
        await this.bucket.remove(uploadedKey).catch(() => undefined);
      }

      await this.local.removeSessionDir(uploadId);

      logStreamUploadError(this.logger, {
        msg: 'merge_or_persist_failed',
        uploadId,
        error: String(err?.message ?? err),
      });

      throw streamProblem('STREAM_MERGE_FAILED');
    }
  }

  async cleanupStaleSessionsCron() {
    const threshold = new Date();

    logStreamUpload(this.logger, {
      msg: 'cleanup_started',
      threshold: threshold.toISOString(),
    });

    const stale = await this.prisma.fileUploadSession.findMany({
      where: {
        status: { not: 'completed' },
        expires_at: { lt: threshold },
      },
    });

    let removed = 0;
    for (const row of stale) {
      await this.local.removeSessionDir(row.id);
      await this.prisma.fileUploadSession.deleteMany({ where: { id: row.id } });
      removed += 1;
    }

    await this.cleanupOrphanStageFiles(
      path.join(this.streamConfig.tempRootAbs, '_stage'),
    );

    logStreamUpload(this.logger, {
      msg: 'cleanup_completed',
      sessionsRemoved: removed,
    });

    try {
      const base = this.local.uploadsBaseDir();
      const orphanDirs = await fs.readdir(base, {
        withFileTypes: true,
      });
      const known = new Set(
        (
          await this.prisma.fileUploadSession.findMany({
            select: { id: true },
          })
        ).map((r) => r.id),
      );
      for (const dirent of orphanDirs) {
        if (!dirent.isDirectory()) continue;
        const id = dirent.name;
        if (!ObjectId.isValid(id) || known.has(id)) continue;
        await this.local.removeSessionDir(id).catch(() => undefined);
      }
    } catch {
      /* uploads base missing */
    }
  }

  private async cleanupOrphanStageFiles(stageRoot: string) {
    let entries;
    try {
      entries = await fs.readdir(stageRoot, { withFileTypes: true });
    } catch {
      return;
    }
    const cutoff = Date.now() - this.streamConfig.sessionTtlMs;
    for (const dirent of entries) {
      if (!dirent.isFile()) continue;
      const pathMod = `${stageRoot}/${dirent.name}`;
      try {
        const st = await fs.stat(pathMod);
        if (st.mtimeMs < cutoff) {
          await fs.unlink(pathMod);
          logStreamUpload(this.logger, {
            msg: 'staging_orphan_removed',
            path: pathMod,
          });
        }
      } catch {
        /* skip */
      }
    }
  }
}
