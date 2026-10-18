import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryModule } from '../inventory/inventory.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { DelhiveryModule } from '../delhivery/delhivery.module';
import { OrderModule } from '../order/order.module';
import { NotificationModule } from '../notifications/notifications.module';
import { CompanyInfoModule } from '../setting/company-info/company-info.module';

@Module({
  imports: [
    InventoryModule,
    InvoiceModule,
    DelhiveryModule,
    OrderModule,
    NotificationModule,
    CompanyInfoModule,
  ],
  providers: [PaymentService, PrismaService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
