import { Module } from '@nestjs/common';
import { FrameMaterialController } from './frame-material.controller';
import { FrameMaterialService } from './frame-material.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [FrameMaterialController],
  providers: [FrameMaterialService, PrismaService],
  exports: [FrameMaterialService],
})
export class FrameMaterialModule {}
