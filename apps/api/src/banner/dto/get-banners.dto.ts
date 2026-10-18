import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';

export class GetBannersDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search term for banners' })
  search_term?: string;

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false })
  sort_by?: string;
}
