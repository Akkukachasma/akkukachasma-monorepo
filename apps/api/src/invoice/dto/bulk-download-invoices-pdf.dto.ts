import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BulkInvoiceHtmlItemDto {
  @ApiProperty({ description: 'Invoice id' })
  @IsMongoId()
  id!: string;

  @ApiProperty({
    description:
      'Full HTML document from client-rendered admin invoice (same as single PDF)',
  })
  @IsString()
  @MinLength(32)
  html!: string;
}

export class BulkDownloadInvoicesPdfDto {
  @ApiProperty({
    description:
      'Client-rendered invoice HTML documents (admin UI layout) to merge into one PDF',
    type: [BulkInvoiceHtmlItemDto],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BulkInvoiceHtmlItemDto)
  invoices!: BulkInvoiceHtmlItemDto[];
}
