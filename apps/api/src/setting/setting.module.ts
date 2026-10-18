import { Module } from '@nestjs/common';
import { InvoiceTaxModule } from './invoice-tax/invoice-tax.module';
import { CompanyInfoModule } from './company-info/company-info.module';
import { TaxCalculationService } from './tax-calculation.service';
import { PrismaService } from '../prisma/prisma.service';
import { PincodeService } from '../address/pincode.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule, InvoiceTaxModule, CompanyInfoModule],
  providers: [TaxCalculationService, PrismaService, PincodeService],
  exports: [TaxCalculationService],
})
export class SettingModule {}
