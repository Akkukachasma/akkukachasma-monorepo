import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { BucketModule } from '../bucket/bucket.module';
import { MediaStreamModule } from '../media-stream/media-stream.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductColorEmbeddingController } from './product-color-embedding.controller';
import { ProductColorEmbeddingService } from './product-color-embedding.service';
import { ProductColorEmbeddingConfigService } from './product-color-embedding.config';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    FileModule,
    BucketModule,
    MediaStreamModule,
    NotificationModule,
  ],
  controllers: [ProductColorEmbeddingController],
  providers: [
    ProductColorEmbeddingService,
    ProductColorEmbeddingConfigService,
  ],
  exports: [ProductColorEmbeddingService],
})
export class ProductColorEmbeddingModule {}
