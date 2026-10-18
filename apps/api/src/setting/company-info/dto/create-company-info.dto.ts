import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, IsEmail, ValidateIf } from 'class-validator';

export class CreateCompanyInfoDto {
  @ApiProperty({ description: 'Company name', example: 'Akku Ka Chasma' })
  @IsString()
  company_name: string;

  @ApiProperty({ description: 'Store name', example: 'JEEVANBHIMA NAGAR STORE' })
  @IsString()
  store_name: string;

  @ApiProperty({ description: 'Store address', example: 'Akku Ka Chasma (GROUND FLOOR)' })
  @IsString()
  store_address: string;

  @ApiProperty({ description: 'Full address', example: 'Jeevanbhima Nagar Main Road (29) - 560075' })
  @IsString()
  full_address: string;

  @ApiProperty({ description: 'Company email', example: 'support@akkukachasma.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Company phone', example: '9999899998' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Company website', example: 'www.akkukachasma.com' })
  @IsString()
  website: string;

  @ApiProperty({ description: 'GSTIN number', example: '06AADCD9571D1ZO' })
  @IsString()
  gstin: string;

  @ApiProperty({ description: 'Company Identification Number', required: false })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiProperty({ description: 'Permanent Account Number', required: false })
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiProperty({
    description: 'Raw base64 image payload for invoices (omit or null to clear on update)',
    required: false,
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  signature?: string | null;

  @ApiPropertyOptional({
    description: 'Whether Cash on Delivery orders are accepted',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  cod_enabled?: boolean;
}
