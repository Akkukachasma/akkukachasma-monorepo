import { ArticleStatus } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  thumbnail?: string;

  @ApiProperty({
    description: 'The title of the article',
    example: 'Understanding TypeScript Decorators',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL-friendly version of the title',
    example: 'understanding-typescript-decorators',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Meta description for SEO purposes',
    example:
      'Learn about TypeScript decorators and how to use them effectively',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The main content of the article',
    example:
      'Decorators provide a way to add both annotations and metadata to class declarations...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'SEO keywords for the article',
    example: ['typescript', 'decorators', 'programming'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional({
    description: 'Optional SEO title if different from main title',
    example: 'TypeScript Decorators Guide - Complete Tutorial',
  })
  @IsOptional()
  @IsString()
  seo_title?: string;

  @ApiProperty({
    description: 'Current status of the article',
    enum: ArticleStatus,
    example: ArticleStatus.DRAFT,
  })
  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @ApiPropertyOptional({
    description: 'Alt text for thumbnail image (SEO purposes)',
    example: 'TypeScript decorators concept diagram',
  })
  @IsOptional()
  @IsString()
  thumbnail_alt?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    type: [String],
    description: 'Array of MongoDB ObjectIds for shapes',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  shape_ids: string[];

  @ApiProperty({
    type: [String],
    description: 'Array of MongoDB ObjectIds for categories',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  category_ids: string[];
}
