import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class RecordShareDto {
  @IsMongoId()
  @Transform(({ value }) => value?.toString())
  @ApiProperty({ description: 'ProductColor id that was shared' })
  product_color_id: string;
}
