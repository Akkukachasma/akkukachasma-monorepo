import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateTitleDescriptionDto } from '../../prisma/dto/common.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShapeDto extends CreateTitleDescriptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ description: 'Id of uploaded image.' })
  image?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  seo_title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  meta_description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'SEO keywords',
    type: [String],
    example: ['round', 'eyeglasses'],
  })
  keywords?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Slug for the brand', required: false })
  slug?: string;
}
