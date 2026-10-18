import { Module } from '@nestjs/common';
import { CompanyInfoController } from './company-info.controller';
import { CompanyInfoService } from './company-info.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationModule } from '../../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [CompanyInfoController],
  providers: [CompanyInfoService, PrismaService],
  exports: [CompanyInfoService],
})
export class CompanyInfoModule {}
