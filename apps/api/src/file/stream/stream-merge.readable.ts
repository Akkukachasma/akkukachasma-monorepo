import { createReadStream } from 'fs';
import { Readable } from 'stream';

/**
 * Reads chunk files in order into a single readable without merging to one temp file.
 */
export function createSequentialChunkReadable(
  chunkPaths: string[],
): Readable {
  return Readable.from(
    (async function* () {
      for (const filePath of chunkPaths) {
        const stream = createReadStream(filePath);
        for await (const part of stream) {
          yield part as Buffer;
        }
      }
    })(),
  );
}
