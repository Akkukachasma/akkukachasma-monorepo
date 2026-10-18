import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';
import { FranchiseRequestStatus } from '@prisma/client';

export class GetFranchiseRequestDto extends PaginateQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved'])
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ApiPropertyOptional({ enum: ['pending', 'approved'] })
  status?: FranchiseRequestStatus;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search term to filter by name or email' })
  search_term?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by phone number' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by date range (start date in ISO format)' })
  start_date?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by date range (end date in ISO format)' })
  end_date?: string;

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiPropertyOptional({ 
    required: false,
    enum: SORT_BY_DEFAULTS,
    description: 'Sort order for the results' 
  })
  sort_by?: string;
} 