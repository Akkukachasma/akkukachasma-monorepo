import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HeroMediaType } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class ActivateHeroMediaDto {
  @ApiPropertyOptional({
    description: 'Single file id (legacy). Use file_ids for multi-file heroes.',
  })
  @ValidateIf((o: ActivateHeroMediaDto) => !o.file_ids?.length)
  @IsMongoId()
  file_id?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'New file ids from chunked upload only. Existing active hero files are merged on the server unless replace_all is true.',
  })
  @ValidateIf((o: ActivateHeroMediaDto) => !o.file_id)
  @IsArray()
  @IsMongoId({ each: true })
  file_ids?: string[];

  @ApiPropertyOptional({
    description:
      'When true, only file_ids are used. When false (default), new files are appended to the current active hero files.',
  })
  @IsOptional()
  @IsBoolean()
  replace_all?: boolean;

  @ApiPropertyOptional({ enum: HeroMediaType, default: HeroMediaType.BANNER })
  @IsOptional()
  @IsEnum(HeroMediaType)
  type?: HeroMediaType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description:
      'When true (default), remove files from the previous active hero.',
  })
  @IsOptional()
  @IsBoolean()
  delete_previous_file?: boolean;
}
