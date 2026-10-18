import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateTitleDescriptionDto } from '../../prisma/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLensFeatureDto extends CreateTitleDescriptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  image?: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  power_type_id: string;
}
