import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Nearby, Owner } from '@prisma/client';

export class CreateFranchiseRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the franchise applicant' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email address (must be unique)' })
  email: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  @ApiProperty({ description: 'Phone number' })
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Pincode for address lookup' })
  pincode: string;

  @IsEnum(Owner)
  @ApiProperty({ enum: Owner, description: 'Ownership type' })
  owner: Owner;

  @ValidateIf((o) => o.owner === Owner.other)
  @IsNotEmpty({ message: 'Please specify the ownership details when you select Other.' })
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ description: 'Required when owner is other' })
  other_owner?: string;

  @IsEnum(Nearby)
  @ApiProperty({ enum: Nearby, description: 'Nearby landmark type' })
  nearby: Nearby;

  @ValidateIf((o) => o.nearby === Nearby.other)
  @IsNotEmpty({
    message: 'Please describe what is nearby when you select Other.',
  })
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ description: 'Required when nearby is other' })
  other_near_by?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Additional message' })
  message?: string;
} 