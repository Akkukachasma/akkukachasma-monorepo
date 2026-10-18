import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';

export class GetTryAtHomeDto extends PaginateQueryDto {
  @ApiPropertyOptional({ description: 'Search term for name, email, etc.' })
  @IsOptional()
  @IsString()
  search_term?: string;

  @ApiPropertyOptional({ description: 'Purpose ID to filter requests' })
  @IsOptional()
  @IsString()
  purpose_id?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering requests' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for filtering requests' })
  @IsOptional()
  @IsDateString()
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