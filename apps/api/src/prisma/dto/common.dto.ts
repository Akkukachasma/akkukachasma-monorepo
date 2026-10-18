import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RequiredIdDto {
  @IsMongoId()
  @ApiProperty()
  id: string;
}

export class CreateTitleDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;
}

export class UpdateTitleDescriptionDto extends PartialType(
  CreateTitleDescriptionDto,
) {}

export class ParamSlugDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  @ApiProperty()
  slug: string;
}
