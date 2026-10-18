import { IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';

export class GetLensDetailDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search_term?: string;

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false })
  sort_by?: string;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({
    required: false,
    description: 'Helps getting lens details of a lens-feature',
  })
  lens_feature_id?: string;
}
