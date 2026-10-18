import { Module } from '@nestjs/common';
import { PowerTypeService } from './power-type.service';
import { PowerTypeController } from './power-type.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BucketModule } from '../bucket/bucket.module';
import { FileModule } from '../file/file.module';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, BucketModule, FileModule, NotificationModule],
  controllers: [PowerTypeController],
  providers: [PowerTypeService],
  exports: [PowerTypeService],
})
export class PowerTypeModule {}
