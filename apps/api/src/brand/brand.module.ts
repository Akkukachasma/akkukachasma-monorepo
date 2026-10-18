import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [BrandController],
  providers: [BrandService, PrismaService],
  exports: [BrandService],
})
export class BrandModule {}
