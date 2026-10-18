import {
  IsMongoId,
  IsOptional,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerImageDto {
  @ApiProperty({ description: 'MongoDB ID of the image (File ID)' })
  @IsMongoId()
  image: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @IsUrl()
  @ApiPropertyOptional({ description: 'Url for the image (optional)' })
  url?: string;
}
