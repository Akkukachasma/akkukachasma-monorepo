import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { GetCategoryProductsDto } from '../../category/dto/get-category-products.dto';

/**
 * DTO for product search with filters.
 * Extends category products filters with slug-based filters.
 * Gender, category_slug, and shape_slug use OR logic (product matches any).
 */
export class GetSearchProductsDto extends GetCategoryProductsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by category slug',
    example: 'sunglasses',
  })
  category_slug?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by shape slug',
    example: 'wayfarer',
  })
  shape_slug?: string;
}
