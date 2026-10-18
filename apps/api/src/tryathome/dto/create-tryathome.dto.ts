import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidAddressLine } from '../../address/validators/address-line.validator';

export class CreateTryAtHomeDto {
  @ApiProperty({ description: 'Name of the requester' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address of the requester' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number of the requester' })
  @IsPhoneNumber("IN")
  phone_number: string;

  @ApiPropertyOptional({ description: 'Optional message from the requester' })
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @ValidateIf((o) => typeof o.address === 'string' && o.address.trim() !== '')
  @IsString()
  @IsValidAddressLine()
  @ApiPropertyOptional({ description: 'Address of the requester' })
  address?: string;

  @ApiProperty({ description: 'Zip code for address lookup' })
  @IsString()
  zip_code: string;

  @ApiProperty({ description: 'Purpose of the try at home request' })
  @IsMongoId()
  purpose_id: string;

} 