import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';

export class GetFrameMaterialDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search_term?: string;

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false })
  sort_by?: string;
}
