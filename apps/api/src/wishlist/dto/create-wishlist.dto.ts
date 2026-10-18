import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWishlistDto {
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({
    description: 'ProductColor (frame variant) ID',
    type: String,
  })
  product_color_id: string;
}
