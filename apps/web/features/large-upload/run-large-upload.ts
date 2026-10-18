import { computeChunkPlan, blobSliceForChunk } from "./chunk-plan";
import {
  createLargeUploadChunkClient,
  createLargeUploadJsonClient,
  parseAxiosApiError,
  postChunk,
  requestCancel,
  requestComplete,
  requestInit,
  requestStatus,
} from "./stream-api";

export type LargeUploadPhase =
  | "preparing"
  | "uploading"
  | "retrying"
  | "paused"
  | "merging"
  | "completed"
  | "failed"
  | "cancelled";

export interface LargeUploadProgress {
  phase: LargeUploadPhase;
  percentApprox: number;
  uploadedChunks: number;
  totalChunks: number;
  bytesUploaded: number;
  totalBytes: number;
  speedBpsAvg?: number;
  etaSeconds?: number | null;
  lastError?: string;
  retryChunkIndex?: number;
  retryAttempt?: number;
}

export type LargeUploadHooks = {
  onProgress?: (progress: LargeUploadProgress) => void;
  isPaused: () => boolean;
  concurrency?: number;
  maxRetriesPerChunk?: number;
};

export type LargeUploadOutcome =
  | { ok: true; file: Record<string, unknown>; uploadId: string }
  | { ok: false; reason: "cancelled" | "failed"; message?: string; uploadId?: string };

const MAX_INIT_ATTEMPTS = 12;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitWhilePaused(
  isPaused: () => boolean,
  signal?: AbortSignal,
): Promise<void> {
  while (isPaused()) {
    if (signal?.aborted) return;
    await sleep(200);
  }
}

async function backoffDelay(attempt: number) {
  const base = Math.min(30_000, 750 * Math.pow(2, attempt));
  await sleep(base + Math.random() * 250);
}

export async function runResumableLargeUpload(
  file: File,
  hooks: LargeUploadHooks,
  signal?: AbortSignal,
): Promise<LargeUploadOutcome> {
  const json = createLargeUploadJsonClient();
  const chunkClient = createLargeUploadChunkClient();
  const isPaused = hooks.isPaused;
  const concurrency = Math.max(1, hooks.concurrency ?? 3);
  const maxRetries = hooks.maxRetriesPerChunk ?? 10;

  const emitPartial = hooks.onProgress;
  const emit = (p: Partial<LargeUploadProgress> & Pick<LargeUploadProgress, "phase">) => {
    emitPartial?.({
      percentApprox: 0,
      uploadedChunks: 0,
      totalChunks: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
      ...p,
    });
  };

  emit({
    phase: "preparing",
    percentApprox: 0,
    uploadedChunks: 0,
    totalChunks: 0,
    bytesUploaded: 0,
    totalBytes: file.size,
  });

  let uploadId: string | undefined;

  try {
    let chunkCap = 16 * 1024 * 1024;
    let initData: { uploadId: string; maxChunkBytes: number } | undefined;

    for (let attempt = 0; attempt < MAX_INIT_ATTEMPTS; attempt++) {
      const plan = computeChunkPlan(file.size, chunkCap);
      try {
        const resp = await requestInit(json, {
          filename: file.name,
          mimetype: file.type || "application/octet-stream",
          totalSize: file.size,
          totalChunks: plan.totalChunks,
        });
        if (!resp?.data?.uploadId) {
          throw new Error("Init response missing uploadId");
        }
        initData = {
          uploadId: resp.data.uploadId,
          maxChunkBytes: resp.data.maxChunkBytes,
        };
        break;
      } catch (e) {
        const { code } = parseAxiosApiError(e);
        chunkCap = Math.floor(chunkCap / 2);
        if (
          code !== "STREAM_BAD_TOTALS" ||
          chunkCap < 512 * 1024 ||
          attempt === MAX_INIT_ATTEMPTS - 1
        ) {
          throw e;
        }
      }
    }

    if (!initData) {
      throw new Error("Large upload initialization failed.");
    }

    uploadId = initData.uploadId;
    const finalPlan = computeChunkPlan(file.size, initData.maxChunkBytes);

    const statusPayload = await requestStatus(json, uploadId);
    const existing = new Set(
      (statusPayload?.data?.uploadedChunkIndices ?? []) as number[],
    );

    const pending: number[] = [];
    for (let i = 0; i < finalPlan.totalChunks; i++) {
      if (!existing.has(i)) pending.push(i);
    }

    const chunkQueues: number[][] = Array.from({ length: concurrency }, () => []);
    for (let i = 0; i < pending.length; i += 1) {
      chunkQueues[i % concurrency].push(pending[i]!);
    }

    let completedChunks = finalPlan.totalChunks - pending.length;
    const startedAt = Date.now();

    emit({
      phase: "uploading",
      uploadedChunks: completedChunks,
      totalChunks: finalPlan.totalChunks,
      percentApprox: Math.round(
        (completedChunks / Math.max(1, finalPlan.totalChunks)) * 100,
      ),
      bytesUploaded:
        (completedChunks / Math.max(1, finalPlan.totalChunks)) * file.size,
      totalBytes: file.size,
    });

    console.info("[large-upload]", {
      evt: "session_ready",
      uploadId,
      totalChunks: finalPlan.totalChunks,
      bytes: file.size,
      resumeMissing: pending.length,
    });

    const uploadChunkWithRetry = async (chunkIndex: number) => {
      if (signal?.aborted) {
        throw new DOMException("aborted", "AbortError");
      }
      await waitWhilePaused(isPaused, signal);

      emit({
        phase: isPaused() ? "paused" : "uploading",
        uploadedChunks: completedChunks,
        totalChunks: finalPlan.totalChunks,
        bytesUploaded:
          (completedChunks / Math.max(1, finalPlan.totalChunks)) * file.size,
        percentApprox: Math.round(
          (completedChunks / Math.max(1, finalPlan.totalChunks)) * 100,
        ),
      });

      const blob = blobSliceForChunk(file, finalPlan.totalChunks, chunkIndex);

      let lastErr = "";
      for (let retry = 0; retry < maxRetries; retry++) {
        if (signal?.aborted) {
          throw new DOMException("aborted", "AbortError");
        }
        await waitWhilePaused(isPaused, signal);

        if (retry > 0) {
          emit({
            phase: "retrying",
            retryChunkIndex: chunkIndex,
            retryAttempt: retry + 1,
            totalChunks: finalPlan.totalChunks,
            uploadedChunks: completedChunks,
            totalBytes: file.size,
            percentApprox: Math.round(
              (completedChunks / Math.max(1, finalPlan.totalChunks)) * 100,
            ),
          });
          console.warn("[large-upload]", {
            evt: "chunk_retry",
            uploadId,
            chunkIndex,
            attempt: retry + 1,
          });
        }

        try {
          await postChunk(chunkClient, {
            uploadId: uploadId as string,
            chunkIndex,
            blob,
          });

          completedChunks += 1;

          const now = Date.now();
          const done = completedChunks;
          const pct = Math.round((done / finalPlan.totalChunks) * 100);
          const bytesApprox = Math.min(
            file.size,
            (done / finalPlan.totalChunks) * file.size,
          );
          const elapsedSec = Math.max((now - startedAt) / 1000, 0.001);
          const speed = bytesApprox / elapsedSec;
          const eta =
            speed > 0 ? Math.max(0, (file.size - bytesApprox) / speed) : null;

          emit({
            phase: "uploading",
            uploadedChunks: done,
            totalChunks: finalPlan.totalChunks,
            bytesUploaded: bytesApprox,
            totalBytes: file.size,
            percentApprox: pct,
            speedBpsAvg: speed,
            etaSeconds: eta !== null ? Math.round(eta) : null,
          });

          return;
        } catch (err) {
          const parsed = parseAxiosApiError(err);
          lastErr = parsed.message;
          emit({
            phase: "retrying",
            lastError: lastErr,
            retryChunkIndex: chunkIndex,
            retryAttempt: retry + 1,
            totalChunks: finalPlan.totalChunks,
            uploadedChunks: completedChunks,
            bytesUploaded:
              (completedChunks / Math.max(1, finalPlan.totalChunks)) *
              file.size,
            totalBytes: file.size,
            percentApprox: Math.round(
              (completedChunks / Math.max(1, finalPlan.totalChunks)) * 100,
            ),
          });
          if (retry >= maxRetries - 1) {
            throw err;
          }
          await backoffDelay(retry);
        }
      }

      throw new Error(lastErr || "Chunk retries exhausted.");
    };

    await Promise.all(
      chunkQueues.map(async (lane) => {
        for (const chunkIndex of lane) {
          if (signal?.aborted) throw new DOMException("aborted", "AbortError");
          await waitWhilePaused(isPaused, signal);
          await uploadChunkWithRetry(chunkIndex);
        }
      }),
    );

    if (signal?.aborted) throw new DOMException("aborted", "AbortError");

    emit({
      phase: "merging",
      percentApprox: 100,
      uploadedChunks: finalPlan.totalChunks,
      totalChunks: finalPlan.totalChunks,
      bytesUploaded: file.size,
      totalBytes: file.size,
    });

    console.info("[large-upload]", {
      evt: "merge_requested",
      uploadId,
      filename: file.name,
    });

    const completeResp = await requestComplete(json, uploadId);

    emit({
      phase: "completed",
      percentApprox: 100,
      uploadedChunks: finalPlan.totalChunks,
      totalChunks: finalPlan.totalChunks,
      bytesUploaded: file.size,
      totalBytes: file.size,
    });

    console.info("[large-upload]", {
      evt: "complete",
      uploadId,
    });

    return {
      ok: true,
      uploadId,
      file: (completeResp?.data ?? {}) as Record<string, unknown>,
    };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      emit({ phase: "cancelled", totalBytes: file.size });
      if (uploadId) {
        try {
          await requestCancel(json, uploadId);
          console.warn("[large-upload]", { evt: "cancel_backend", uploadId });
        } catch {
          /* ignore */
        }
      }
      return { ok: false, reason: "cancelled", uploadId };
    }

    const parsed = parseAxiosApiError(e);
    emit({
      phase: "failed",
      lastError: parsed.message,
      totalBytes: file.size,
    });
    console.error("[large-upload]", {
      evt: "failed",
      uploadId,
      message: parsed.message,
    });

    try {
      if (uploadId) await requestCancel(json, uploadId);
    } catch {
      /* ignore */
    }

    return {
      ok: false,
      reason: "failed",
      uploadId,
      message: parsed.message,
    };
  }
}
