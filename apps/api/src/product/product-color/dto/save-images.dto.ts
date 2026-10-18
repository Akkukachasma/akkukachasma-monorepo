import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SaveImagesDto {
  @ApiProperty({
    description: 'Ids of uploaded images',
    example: ['67cbf0da941f1fcbb4c5eff7', '67cbf0dc941f1fcbb4c5eff8'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  file_ids: string[];
}
