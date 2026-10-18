import { Module } from '@nestjs/common';
import { InvoiceTaxController } from './invoice-tax.controller';
import { InvoiceTaxService } from './invoice-tax.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheModule } from '../../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [InvoiceTaxController],
  providers: [InvoiceTaxService, PrismaService],
})
export class InvoiceTaxModule {}
