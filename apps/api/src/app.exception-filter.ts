import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ERR_TYPES } from '../lib/constants';
import { ActivityLoggerService } from './activity/activity-logger.service';
import { uploadLimitExceededMessage } from './file/upload-limits';

export type ExceptionResponseType = object & {
  type: string;
};

/** Status codes we log to Activity (5xx + auth 401/403). Skip routine 400/404 to avoid bloat. */
const LOGGED_STATUSES = new Set([
  HttpStatus.UNAUTHORIZED,
  HttpStatus.FORBIDDEN,
  HttpStatus.PAYMENT_REQUIRED,
  HttpStatus.INTERNAL_SERVER_ERROR,
  HttpStatus.BAD_GATEWAY,
  HttpStatus.SERVICE_UNAVAILABLE,
  HttpStatus.GATEWAY_TIMEOUT,
]);

function isOversizeUploadError(exception: unknown): boolean {
  if (!exception || typeof exception !== 'object') return false;
  const err = exception as {
    name?: string;
    code?: string;
    message?: string;
    status?: number;
    statusCode?: number;
  };
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return true;
  }
  if (err.code === 'LIMIT_FILE_SIZE') return true;
  const status = err.status ?? err.statusCode;
  if (status === HttpStatus.PAYLOAD_TOO_LARGE) return true;
  const msg = String(err.message ?? '').toLowerCase();
  return (
    msg.includes('file too large') ||
    msg.includes('content too large') ||
    msg.includes('payload too large')
  );
}

function uploadTooLargeException() {
  return new BadRequestException({
    success: false,
    message: uploadLimitExceededMessage(),
    type: 'bad_request',
    code: 'UPLOAD_FILE_TOO_LARGE',
  });
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly activityLogger: ActivityLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (isOversizeUploadError(exception)) {
      exception = uploadTooLargeException();
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionResponse: ExceptionResponseType | string | null = null;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
        exception = uploadTooLargeException();
        status = HttpStatus.BAD_REQUEST;
      }
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exceptionResponse = exception.getResponse() as
        | ExceptionResponseType
        | string;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const body = exceptionResponse as Record<string, unknown>;
      const m = body.message;
      if (typeof m === 'string') {
        message = m;
      } else if (Array.isArray(m) && typeof m[0] === 'string') {
        message = m[0];
      }
    }

    let type = ERR_TYPES.internal_server_err;
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      type = (exceptionResponse as { type?: string }).type || type;
    }

    const extras: Record<string, unknown> = {};
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const body = exceptionResponse as Record<string, unknown>;
      if (typeof body.code === 'string') {
        extras.code = body.code;
      }
      if (typeof body.success === 'boolean') {
        extras.success = body.success;
      }
    }

    const responseBody = {
      status,
      timestamp: new Date().toISOString(),
      message,
      type,
      ...extras,
    };

    const shouldLog = status >= 500 || LOGGED_STATUSES.has(status);
    if (shouldLog) {
      const user_id = (request as Request & { user?: { id?: string } }).user?.id;
      const detail = {
        source: 'http_exception' as const,
        path: request?.path,
        method: request?.method,
        status,
        message,
        type,
        user_id: user_id ?? undefined,
      };
      if (status >= 500) {
        this.activityLogger.logError(
          `HTTP ${status}: ${message}`,
          undefined,
          detail,
          user_id,
        );
      } else {
        this.activityLogger.logWarning(
          `HTTP ${status}: ${message}`,
          undefined,
          detail,
          user_id,
        );
      }
    }

    response.status(status).json(responseBody);
  }
}
