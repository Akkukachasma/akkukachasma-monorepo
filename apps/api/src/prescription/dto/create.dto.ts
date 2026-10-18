import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PrescriptionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({
    enum: PrescriptionType,
    description: 'Type of the prescription: fillup or photo',
  })
  @IsEnum(PrescriptionType)
  type: PrescriptionType;

  @ApiPropertyOptional({
    description: 'Additional comments for the prescription',
  })
  @IsOptional()
  @IsString()
  comments?: string;

  // Fillup fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  right_sph?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  right_cyl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  right_axis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  right_add?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  left_sph?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  left_cyl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  left_axis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  left_add?: string;

  // For photo type
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'The mongodb id of uploaded image if prescription_type is photo',
  })
  @IsOptional()
  @IsMongoId()
  image?: string;
}
