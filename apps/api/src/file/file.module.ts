import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BucketModule } from '../bucket/bucket.module';
import { FileUploadInterceptor } from '../bucket/file-upload.interceptor';
import { FileRemovalInterceptor } from '../bucket/file-removal.interceptor';
import { FileCrons } from './file.crons';
import { FileStreamUploadController } from './stream/file-stream-upload.controller';
import { FileStreamUploadService } from './stream/file-stream-upload.service';
import { FileStreamUploadCrons } from './stream/file-stream-upload.crons';
import { FileStreamConfigService } from './stream/file-stream-config.service';
import { FileStreamLocalStorageService } from './stream/file-stream-local-storage.service';
import { BusboyChunkInterceptor } from './stream/busboy-chunk.interceptor';

@Module({
  imports: [PrismaModule, BucketModule],
  controllers: [FileController, FileStreamUploadController],
  providers: [
    FileService,
    FileCrons,
    FileUploadInterceptor,
    FileRemovalInterceptor,
    FileStreamConfigService,
    FileStreamLocalStorageService,
    FileStreamUploadService,
    BusboyChunkInterceptor,
    FileStreamUploadCrons,
  ],
  exports: [FileService],
})
export class FileModule {}
