import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurposeDto {
  @ApiProperty({ description: 'Label for the try at home purpose' })
  @IsString()
  label: string;
} 