import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ADMIN_PRODUCT_STOCK_SCOPE,
  SORT_BY_DEFAULTS,
} from '../../../lib/constants';

export class GetProductsDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'Search products (name, slug, tags, etc.) and product color model number',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Alias for search (admin client compatibility)',
    deprecated: true,
  })
  search_term?: string;

  @IsOptional()
  @IsIn(ADMIN_PRODUCT_STOCK_SCOPE)
  @ApiPropertyOptional({
    enum: ADMIN_PRODUCT_STOCK_SCOPE,
    default: 'all',
    description:
      'When out_of_stock, only ProductColor rows with null or non-positive stock_quantity',
  })
  stock_scope?: (typeof ADMIN_PRODUCT_STOCK_SCOPE)[number];

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false, description: 'Sort by field' })
  sort_by?: string;
}
