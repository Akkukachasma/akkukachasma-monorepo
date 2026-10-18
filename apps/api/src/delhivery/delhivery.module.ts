import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DelhiveryController } from './delhivery.controller';
import { DelhiveryService } from './delhivery.service';
import { DelhiveryWebhookService } from './delhivery-webhook.service';
import { OrderStatusSyncService } from './order-status-sync.service';
import { OrderStatusSyncCron } from './order-status-sync.cron';
import { PrismaModule } from '../prisma/prisma.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    InvoiceModule,
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [DelhiveryController],
  providers: [
    DelhiveryService,
    DelhiveryWebhookService,
    OrderStatusSyncService,
    OrderStatusSyncCron,
  ],
  exports: [DelhiveryService, DelhiveryWebhookService, OrderStatusSyncService],
})
export class DelhiveryModule {}
