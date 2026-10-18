import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class ExportInvoicesAccountingDto {
  @ApiProperty({
    description: 'Order ids selected for accountant export',
    type: [String],
    minItems: 1,
    maxItems: 200,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsMongoId({ each: true })
  order_ids!: string[];
}
