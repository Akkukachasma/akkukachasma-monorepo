import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, Min } from 'class-validator';

export class ReorderCategoryDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}

