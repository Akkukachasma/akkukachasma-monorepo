import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { MAX_EMBED_CODE_LENGTH } from '../embed-code.util';

export class CreateProductColorEmbeddingDto {
  @ApiProperty()
  @IsMongoId()
  product_color_id: string;

  @ApiPropertyOptional({
    description:
      'Embed code snippet (iframe HTML, Instagram blockquote, etc.). Mutually exclusive with file_id.',
  })
  @ValidateIf((o) => !o.file_id)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_EMBED_CODE_LENGTH)
  embed_code?: string;

  @ApiPropertyOptional({
    description:
      'Video file id from POST /files/stream/complete (mutually exclusive with embed_code)',
  })
  @ValidateIf((o) => !o.embed_code)
  @IsOptional()
  @IsMongoId()
  file_id?: string;
}
