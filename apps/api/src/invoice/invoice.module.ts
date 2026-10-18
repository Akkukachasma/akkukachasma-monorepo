import { Module, forwardRef } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { PincodeService } from '../address/pincode.service';
import { OrderModule } from '../order/order.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [forwardRef(() => OrderModule), InventoryModule, PdfModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoicePdfService, PrismaService, PincodeService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
