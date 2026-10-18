import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { MAX_EMBED_CODE_LENGTH } from '../embed-code.util';

export class UpdateProductColorEmbeddingDto {
  @ApiPropertyOptional({
    description: 'Embed code snippet (iframe HTML, Instagram blockquote, etc.)',
  })
  @IsOptional()
  @ValidateIf((o) => o.embed_code !== undefined && o.embed_code !== null)
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_EMBED_CODE_LENGTH)
  embed_code?: string | null;

  @ApiPropertyOptional({
    description: 'Replace video via completed stream upload file id',
  })
  @IsOptional()
  @IsMongoId()
  file_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
