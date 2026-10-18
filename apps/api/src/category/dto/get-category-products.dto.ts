import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GetProductsDto } from '../../product/dto/get-product.dto';

/**
 * DTO for fetching category products with filters.
 * Extends product list params with price range, color, shape, and other filters.
 */
export class GetCategoryProductsDto extends GetProductsDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional({
    description: 'Color IDs to filter by (comma-separated or array)',
    type: [String],
  })
  color_ids?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional({
    description: 'Shape IDs to filter by',
    type: [String],
  })
  shape_ids?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsMongoId({ each: true })
  @ApiPropertyOptional({
    description: 'Frame material IDs to filter by',
    type: [String],
  })
  frame_material_ids?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Gender filter (MALE, FEMALE, UNISEX, OTHER)',
    type: [String],
  })
  gender?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description:
      'Frame size filter (EXTRA_NARROW, NARROW, MEDIUM, WIDE, EXTRA_WIDE)',
    type: [String],
  })
  frame_size?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Frame style filter (FULL_FRAME, HALF_FRAME, RIMLESS)',
    type: [String],
  })
  frame_style?: string[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map(Number).filter((n) => !isNaN(n))
      : Array.isArray(value)
        ? value.map(Number).filter((n) => !isNaN(n))
        : [],
  )
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiPropertyOptional({
    description: 'Frame width values to filter by (comma-separated)',
    type: [Number],
  })
  frame_width?: number[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map(Number).filter((n) => !isNaN(n))
      : Array.isArray(value)
        ? value.map(Number).filter((n) => !isNaN(n))
        : [],
  )
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiPropertyOptional({
    description: 'Lens width values to filter by (comma-separated)',
    type: [Number],
  })
  lens_width?: number[];
}
