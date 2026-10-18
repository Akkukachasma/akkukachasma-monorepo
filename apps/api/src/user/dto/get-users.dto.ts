import { IsIn, IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';

export class GetUsersDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false })
  sort_by?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Search term.' })
  search?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, description: 'Filter for blocked users only.' })
  blocked?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Filter by role code (e.g. admin, customer)' })
  role?: string;
}
