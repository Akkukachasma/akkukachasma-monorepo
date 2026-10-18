import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateTitleDescriptionDto } from '../../prisma/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePowerTypeDto extends CreateTitleDescriptionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ description: 'Id of uploaded image.' })
  image?: string;
}
