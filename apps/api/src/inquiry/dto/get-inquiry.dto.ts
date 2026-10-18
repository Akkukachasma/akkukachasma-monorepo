import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { InquirySource } from '@prisma/client';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';

export class GetInquiryDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search term to filter by name or email' })
  search_term?: string;

  @IsOptional()
  @IsEnum(InquirySource)
  @ApiPropertyOptional({ 
    enum: InquirySource,
    description: 'Filter by inquiry source' 
  })
  source?: InquirySource;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by phone number' })
  phone?: string;

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