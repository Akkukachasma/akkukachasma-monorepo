export function expectedChunkByteLength(
  totalSize: number,
  totalChunks: number,
  chunkIndex: number,
): number {
  const base = Math.floor(totalSize / totalChunks);
  const rem = totalSize % totalChunks;
  return base + (chunkIndex < rem ? 1 : 0);
}

export function maxChunkByteLength(
  totalSize: number,
  totalChunks: number,
): number {
  const base = Math.floor(totalSize / totalChunks);
  const rem = totalSize % totalChunks;
  return rem > 0 ? base + 1 : base;
}
