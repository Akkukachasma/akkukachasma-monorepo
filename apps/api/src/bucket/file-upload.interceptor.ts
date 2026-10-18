import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BucketService } from './bucket.service';
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from '../file/upload-limits';

function assertUploadSize(file: Express.Multer.File) {
  if (!isWithinUploadLimit(file.size)) {
    throw new BadRequestException(uploadLimitExceededMessage());
  }
}

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  constructor(private readonly bucketService: BucketService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: any = context.switchToHttp().getRequest();

    if (request.file) {
      assertUploadSize(request.file);
      const meta = await this.bucketService.upload(request.file);
      request.bucket_uploads = meta;
    } else if (Array.isArray(request.files)) {
      for (const file of request.files) {
        assertUploadSize(file);
      }
      const meta = await this.bucketService.uploadMany(request.files);
      request.bucket_uploads = meta;
    } else if (request.files) {
      const filesMeta = {};
      for (const fieldname in request.files) {
        if (request.files[fieldname]) {
          for (const file of request.files[fieldname]) {
            assertUploadSize(file);
          }
          const meta = await this.bucketService.uploadMany(
            request.files[fieldname],
          );
          filesMeta[fieldname] = meta;
        }
      }
      request.bucket_uploads = filesMeta;
    }

    return next.handle();
  }
}
