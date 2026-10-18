import { IsOptional, IsString } from 'class-validator';
import { CreateTitleDescriptionDto } from '../../prisma/dto/common.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto extends CreateTitleDescriptionDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Slug for the brand', required: false })
  slug?: string;
}
