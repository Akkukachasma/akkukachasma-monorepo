import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RecordProductViewsDto {
  @IsOptional()
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiPropertyOptional({ description: 'ProductColor id for variant-specific views' })
  product_color_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Variant model_number when product_color_id is omitted' })
  model_number?: string;
}
