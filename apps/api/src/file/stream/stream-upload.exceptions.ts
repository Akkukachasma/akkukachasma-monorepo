import {
  BadRequestException,
  ConflictException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import {
  STREAM_ERROR_MESSAGES,
  STREAM_UPLOAD_LOG_CONTEXT,
} from './stream-upload.constants';

/** Nest metadata must stay JSON-serializable for filters. */

export type StreamProblemBody = {
  success: false;
  code: string;
  message: string;
  type: 'stream_upload';
};

export function streamProblem(
  code: keyof typeof STREAM_ERROR_MESSAGES | string,
  status: 400 | 404 | 409 | 410 = 400,
) {
  const message =
    typeof code === 'string' && STREAM_ERROR_MESSAGES[code]
      ? STREAM_ERROR_MESSAGES[code]
      : STREAM_ERROR_MESSAGES[code as keyof typeof STREAM_ERROR_MESSAGES] ??
        String(code);

  const body: StreamProblemBody = {
    success: false,
    code: String(code),
    message,
    type: 'stream_upload',
  };

  switch (status) {
    case 404:
      return new NotFoundException(body);
    case 409:
      return new ConflictException(body);
    case 410:
      return new GoneException(body);
    default:
      return new BadRequestException(body);
  }
}

export function logStreamUpload(
  logger: { log: (...a: unknown[]) => void },
  evt: Record<string, unknown>,
) {
  logger.log(
    JSON.stringify({ ctx: STREAM_UPLOAD_LOG_CONTEXT, ...evt, ts: new Date().toISOString() }),
  );
}

export function logStreamUploadWarn(
  logger: { warn: (...a: unknown[]) => void },
  evt: Record<string, unknown>,
) {
  logger.warn(
    JSON.stringify({ ctx: STREAM_UPLOAD_LOG_CONTEXT, ...evt, ts: new Date().toISOString() }),
  );
}

export function logStreamUploadError(
  logger: { error: (...a: unknown[]) => void },
  evt: Record<string, unknown>,
) {
  logger.error(
    JSON.stringify({ ctx: STREAM_UPLOAD_LOG_CONTEXT, ...evt, ts: new Date().toISOString() }),
  );
}
