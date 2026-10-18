import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BannerAspectRatio, BannerType } from '@prisma/client';

export class CreateBannerDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Title of banner/banner group',
    example: 'Perfect Glasses For Kids',
    required: false,
  })
  title?: string;

  @IsEnum(BannerType)
  @ApiProperty({
    description: 'Layout type of the banner',
    enum: BannerType,
  })
  type: BannerType;

  @IsOptional()
  @IsEnum(BannerAspectRatio)
  @ApiProperty({
    description: 'Aspect ratio intent for banner images',
    enum: BannerAspectRatio,
    required: false,
  })
  aspect_ratio?: BannerAspectRatio;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  @ApiProperty({
    description: 'Number of slides visible at once (slider type only)',
    minimum: 1,
    maximum: 6,
    required: false,
  })
  slides_per_view?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether this banner is active',
    default: true,
  })
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether this banner is shown on the home page',
    default: false,
  })
  show_on_home?: boolean;

  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    description: 'MongoDB ObjectIds of categories this banner belongs to',
    type: [String],
  })
  category_ids: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @ApiProperty({
    description: 'MongoDB ObjectIds of shapes this banner belongs to',
    type: [String],
  })
  shape_ids: string[];
}
