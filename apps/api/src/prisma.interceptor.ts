import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, catchError } from 'rxjs';
import { ERR_TYPES } from '../lib/constants';

function prismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
  const meta = error.meta as { cause?: unknown; message?: unknown } | undefined;
  if (typeof meta?.cause === 'string' && meta.cause) {
    return meta.cause;
  }
  if (typeof meta?.message === 'string' && meta.message) {
    return meta.message;
  }
  return error.message;
}

@Injectable()
export class PrismaInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PrismaInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          this.logger.error(
            `Prisma ${error.code}: ${error.message}`,
            error.stack,
          );
          throw new InternalServerErrorException({
            type: ERR_TYPES.prisma_err,
            message: prismaErrorMessage(error),
          });
        }
        throw error;
      }),
    );
  }
}
