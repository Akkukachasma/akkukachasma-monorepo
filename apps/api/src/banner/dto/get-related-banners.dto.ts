import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class GetRelatedBannersDto {
  @IsOptional()
  @IsMongoId()
  @ApiProperty({
    description: 'Category ID to filter banners by',
    required: false,
  })
  category_id?: string;

  @IsOptional()
  @IsMongoId()
  @ApiProperty({
    description: 'Shape ID to filter banners by',
    required: false,
  })
  shape_id?: string;
}
