import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { BannerImageModule } from './banner-image/banner-image.module';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  providers: [BannerService, PrismaService, BucketService, FileService],
  controllers: [BannerController],
  imports: [BannerImageModule, NotificationModule],
})
export class BannerModule {}
