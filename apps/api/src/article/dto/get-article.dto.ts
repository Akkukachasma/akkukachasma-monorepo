// src/article/dto/get-article.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';

export class GetArticleDto extends PaginateQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search_term?: string;

  @ApiProperty({ required: false, enum: ArticleStatus })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;
}
