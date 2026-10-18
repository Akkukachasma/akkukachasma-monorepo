import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';

const ACTIVITY_SORT_BY = ['created_asc', 'created_desc'] as const;
const ACTIVITY_TYPES = ['INFO', 'SUCCESS', 'ERROR', 'WARNING', 'ALERT'] as const;

export class GetActivitiesDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search in title, description, user name/email' })
  search_term?: string;

  @IsOptional()
  @IsString()
  @IsIn(ACTIVITY_TYPES)
  @ApiPropertyOptional({ enum: ACTIVITY_TYPES, description: 'Filter by activity type' })
  type?: string;

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
  @IsIn(ACTIVITY_SORT_BY)
  @ApiPropertyOptional({
    required: false,
    enum: ACTIVITY_SORT_BY,
    description: 'Sort order for the results',
  })
  sort_by?: string;
}
