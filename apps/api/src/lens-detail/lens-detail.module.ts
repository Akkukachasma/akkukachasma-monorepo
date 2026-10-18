import { Module } from '@nestjs/common';
import { LensDetailService } from './lens-detail.service';
import { LensDetailController } from './lens-detail.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { LensFeatureService } from '../lens-feature/lens-feature.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [LensDetailController],
  providers: [
    LensDetailService,
    PrismaService,
    BucketService,
    FileService,
    LensFeatureService,
  ],
})
export class LensDetailModule {}
