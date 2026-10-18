import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MAX_UPLOAD_BYTES, uploadLimitExceededMessage } from '../upload-limits';

export class StreamInitDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  filename: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  mimetype: string;

  @ApiProperty({ maximum: MAX_UPLOAD_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES, { message: uploadLimitExceededMessage() })
  totalSize: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(50_000)
  totalChunks: number;
}
