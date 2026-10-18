import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';

class ReorderItemDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sort_order: number;
}

export class ReorderProductColorEmbeddingsDto {
  @ApiProperty()
  @IsMongoId()
  product_color_id: string;

  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
