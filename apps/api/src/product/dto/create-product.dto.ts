import {
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  ArrayMinSize,
  IsPositive,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrameSize, FrameStyle, Gender } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'SEO title for the product',
    example: 'Designer Rimless Eyeglasses',
  })
  @IsString()
  seo_title: string;

  @ApiProperty({
    description: 'Slug for the product model name',
    example: 'designer-rimless-eyeglasses',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Detailed product description',
    example:
      'Premium quality designer rimless eyeglasses with anti-glare coating',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product tags for better searchability',
    example: ['designer', 'rimless', 'lightweight'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'Model name of the product',
    example: 'Crystal Vue X1',
  })
  @IsString()
  model_name: string;

  @ApiProperty({
    description: 'Target gender for the product',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Width of lens in millimeters',
    example: 52.5,
  })
  @IsNumber()
  @IsPositive()
  lens_width: number;

  @ApiProperty({
    description: 'Height of lens in millimeters',
    example: 35.5,
  })
  @IsNumber()
  @IsPositive()
  lens_height: number;

  @ApiProperty({
    description: 'Width of frame in millimeters',
    example: 138.5,
  })
  @IsNumber()
  @IsPositive()
  frame_width: number;

  @ApiProperty({
    description: 'Original listing price',
    example: 199.99,
  })
  @IsNumber()
  @IsPositive()
  listing_price: number;

  @ApiProperty({
    description: 'Actual selling price',
    example: 149.99,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Source of raw materials',
    default: 'Imported International',
    example: 'Imported International',
  })
  @IsString()
  @IsOptional()
  raw_material_sourced_from?: string;

  @ApiPropertyOptional({
    description: 'Material used for lens',
    default: 'Demo Polycorbonate',
    example: 'Demo Polycorbonate',
  })
  @IsString()
  @IsOptional()
  lens_material?: string;

  @ApiProperty({
    description: 'Style of the frame',
    enum: FrameStyle,
    example: FrameStyle.RIMLESS,
  })
  @IsEnum(FrameStyle)
  frame_style: FrameStyle;

  @ApiProperty({
    description: 'Available frame sizes',
    enum: FrameSize,
    isArray: true,
    example: [FrameSize.MEDIUM, FrameSize.WIDE],
  })
  @IsArray()
  @IsEnum(FrameSize, { each: true })
  @ArrayMinSize(1)
  frame_size: FrameSize[];

  @ApiProperty({
    description: 'Array of power type IDs',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  power_type_ids: string[];

  @ApiProperty({
    description: 'Product color ids information',
    example: [
      { colors: ['507f1f77bcf86cd799439011'] },
      { colors: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd732439012'] },
    ],
    type: [[String]], // Note: Swagger does not deeply infer this well, but the type is a 2D array
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorGroupDto)
  color_ids: ColorGroupDto[];

  @ApiPropertyOptional({
    description: 'Shape ID reference',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsMongoId()
  @IsOptional()
  shape_id?: string;

  @ApiPropertyOptional({
    description: 'Frame material ID reference',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsMongoId()
  @IsOptional()
  frame_material_id?: string;

  @ApiPropertyOptional({
    description: 'Category ID reference',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsMongoId()
  @IsOptional()
  category_id?: string;
}
export class ColorGroupDto {
  @ApiProperty({
    description: 'List of Mongo ObjectIDs for colors',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd732439012'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  colors: string[];
}
