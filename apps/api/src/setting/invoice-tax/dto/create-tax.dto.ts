import { ApiProperty } from '@nestjs/swagger';
import { InvoiceTaxType } from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateInvoiceTaxDto {
  @IsEnum(InvoiceTaxType)
  @ApiProperty({ description: 'Tax type' })
  type: InvoiceTaxType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Provide a label for this tax' })
  label: string;

  @IsString()
  @ApiProperty({
    description: 'Provide a short description for the tax',
    required: false,
  })
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Percentage must be greater than or equal to 0' })
  @ApiProperty({
    description: 'Percentage of tax that needs to be applied',
  })
  percentage: number;

  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    description: 'Ids of categories for that this tax should be applied',
  })
  category_ids: string[];
}
