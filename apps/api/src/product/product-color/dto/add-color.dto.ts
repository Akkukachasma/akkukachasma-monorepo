import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddColorDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty({ description: 'The array of color ids' })
  color_ids: string[];

  @IsOptional()
  @ApiProperty({
    description: 'model_number for the product color',
  })
  @IsString()
  model_number?: string;

  @IsOptional()
  @ApiProperty({
    description:
      'How many products are there in the inventory for this product color',
  })
  @IsNumber()
  stock_quantity?: number;
}
