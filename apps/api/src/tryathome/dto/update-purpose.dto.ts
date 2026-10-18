import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurposeDto {
  @ApiPropertyOptional({ description: 'Label for the try at home purpose' })
  @IsOptional()
  @IsString()
  label?: string;
} 