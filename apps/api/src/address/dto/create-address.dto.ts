import { ApiProperty } from '@nestjs/swagger';
import { AddressLabel } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  IsCityValidForPincode,
  IsStateValidForPincode,
  IsAddressValidForPincode,
} from '../../address/validators/pincode.validator';
import { IsValidAddressLine } from '../../address/validators/address-line.validator';

export class CreateAddressDto {
  @IsEnum(AddressLabel)
  @ApiProperty({
    description: 'A label for address. either of home, work, other',
    enum: AddressLabel,
  })
  label: AddressLabel;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Optional notes for address.' })
  notes?: string;

  @IsString()
  @IsNotEmpty()
  @IsValidAddressLine()
  @ApiProperty({ description: 'The street address.' })
  address: string;

  @IsString()
  @IsNotEmpty()
  @IsCityValidForPincode()
  @ApiProperty({ description: 'The city.' })
  city: string;

  @IsString()
  @IsNotEmpty()
  @IsStateValidForPincode()
  @ApiProperty({ description: 'The state or province.' })
  state: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => {
    return typeof value === 'string' ? value.trim() : value;
  })
  @ApiProperty({ description: 'The postal code.' })
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  @IsAddressValidForPincode()
  @ApiProperty({ description: 'The country.' })
  country: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiProperty({
    required: false,
    description:
      'Set true after user confirms saving when Delhivery serviceability is temporarily unavailable.',
  })
  acknowledge_unverified_pincode?: boolean;
}
