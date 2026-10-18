/** Mirrors backend `expectedChunkByteLength` distribution. */
export function expectedChunkByteLength(
  totalSize: number,
  totalChunks: number,
  chunkIndex: number,
): number {
  const base = Math.floor(totalSize / totalChunks);
  const rem = totalSize % totalChunks;
  return base + (chunkIndex < rem ? 1 : 0);
}

/** Max single-chunk size given how the server partitions bytes. */
export function maxChunkSpanBytes(
  totalSize: number,
  totalChunks: number,
): number {
  const base = Math.floor(totalSize / totalChunks);
  const rem = totalSize % totalChunks;
  return rem > 0 ? base + 1 : base;
}

export type ChunkPlan = {
  totalChunks: number;
  targetSpanBytes: number;
};

const MIN_SPAN = 512 * 1024;

/**
 * Picks `totalChunks` so the largest chunk (per server layout) fits `maxChunkBytes`.
 */
export function computeChunkPlan(
  totalSize: number,
  maxChunkBytes: number,
): ChunkPlan {
  if (totalSize <= 0 || maxChunkBytes <= 0) {
    throw new RangeError("Invalid file or server chunk limit");
  }

  let span = Math.min(4 * 1024 * 1024, maxChunkBytes);
  for (let guard = 0; guard < 64; guard += 1) {
    const totalChunks = Math.ceil(totalSize / span);
    const maxPiece = maxChunkSpanBytes(totalSize, totalChunks);
    if (maxPiece <= maxChunkBytes) {
      return { totalChunks, targetSpanBytes: span };
    }
    span = Math.floor(span / 2);
    if (span < MIN_SPAN) {
      throw new Error(
        "File too large for the server's maximum chunk size. Contact support.",
      );
    }
  }
  throw new Error("Could not derive a valid chunk layout");
}

export function cumulativeOffset(
  totalSize: number,
  totalChunks: number,
  chunkIndex: number,
): number {
  let off = 0;
  for (let i = 0; i < chunkIndex; i += 1) {
    off += expectedChunkByteLength(totalSize, totalChunks, i);
  }
  return off;
}

export function blobSliceForChunk(
  file: File,
  totalChunks: number,
  chunkIndex: number,
): Blob {
  const totalSize = file.size;
  const start = cumulativeOffset(totalSize, totalChunks, chunkIndex);
  const len = expectedChunkByteLength(totalSize, totalChunks, chunkIndex);
  return file.slice(start, start + len);
}
