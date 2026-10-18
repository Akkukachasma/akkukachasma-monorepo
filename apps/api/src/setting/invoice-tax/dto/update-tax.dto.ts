import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceTaxDto } from './create-tax.dto';

export class UpdateInvoiceTaxDto extends PartialType(CreateInvoiceTaxDto) {}
