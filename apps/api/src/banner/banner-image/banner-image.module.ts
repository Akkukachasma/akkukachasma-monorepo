import { Module } from '@nestjs/common';
import { BannerImageController } from './banner-image.controller';
import { BannerImageService } from './banner-image.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BucketService } from '../../bucket/bucket.service';
import { FileService } from '../../file/file.service';
import { NotificationModule } from '../../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [BannerImageController],
  providers: [BannerImageService, PrismaService, BucketService, FileService],
})
export class BannerImageModule {}
