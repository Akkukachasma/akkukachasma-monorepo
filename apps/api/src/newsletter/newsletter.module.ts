import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [NewsletterController],
  providers: [NewsletterService, PrismaService],
})
export class NewsletterModule {}
