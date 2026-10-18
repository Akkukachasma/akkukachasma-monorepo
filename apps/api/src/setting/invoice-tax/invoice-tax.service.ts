import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceTaxDto } from './dto/create-tax.dto';
import { UpdateInvoiceTaxDto } from './dto/update-tax.dto';
import { CacheService } from '../../cache/cache.service';
import { invoiceTaxKeys } from './invoice-tax.keys';

@Injectable()
export class InvoiceTaxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async ensureSetting(user_id: string) {
    let setting = await this.prisma.setting.findUnique({
      where: { user_id },
    });
    if (!setting) {
      setting = await this.prisma.setting.create({
        data: {
          user: { connect: { id: user_id } },
        },
      });
    }
    return setting;
  }

  async duplicateInvoiceTax(name: string, tax_id?: string) {
    return await this.prisma.invoiceTax.findFirst({
      where: {
        label: { equals: name, mode: 'insensitive' },
        ...(tax_id && { id: { not: tax_id } }),
      },
    });
  }

  async createInvoiceTax(
    createInvoiceTaxDto: CreateInvoiceTaxDto,
    setting_id: string,
  ) {
    const { category_ids, ...rest } = createInvoiceTaxDto;
    const created = await this.prisma.invoiceTax.create({
      data: {
        ...rest,
        categories: { connect: category_ids.map((id) => ({ id })) },
        setting: {
          connect: { id: setting_id },
        },
      },
    });
    await this.cache.delByPattern(`${invoiceTaxKeys.prefix}*`);
    return created;
  }

  async findAll() {
    return await this.prisma.invoiceTax.findMany();
  }

  async updateInvoiceTax(
    invoice_tax_id: string,
    updateInvoiceTaxDto: UpdateInvoiceTaxDto,
  ) {
    const { category_ids, ...rest } = updateInvoiceTaxDto;
    const updated = await this.prisma.invoiceTax.update({
      where: { id: invoice_tax_id },
      data: {
        ...rest,
        categories: { set: category_ids.map((id) => ({ id })) },
      },
    });
    await this.cache.delByPattern(`${invoiceTaxKeys.prefix}*`);
    return updated;
  }

  async deleteInvoiceTax(invoice_tax_id: string) {
    const deleted = await this.prisma.invoiceTax.delete({
      where: { id: invoice_tax_id },
    });
    await this.cache.delByPattern(`${invoiceTaxKeys.prefix}*`);
    return deleted;
  }
}
