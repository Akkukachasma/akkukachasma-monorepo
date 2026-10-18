import { Module } from '@nestjs/common';
import { LensFeatureService } from './lens-feature.service';
import { LensFeatureController } from './lens-feature.controller';
import { PowerTypeService } from '../power-type/power-type.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [LensFeatureController],
  providers: [
    LensFeatureService,
    PowerTypeService,
    FileService,
    BucketService,
    PrismaService,
  ],
})
export class LensFeatureModule {}
