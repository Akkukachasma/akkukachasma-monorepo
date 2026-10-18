import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { InquirySource } from '@prisma/client';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({ description: 'First name of the person making the inquiry' })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({ description: 'Last name of the person making the inquiry' })
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  @ApiProperty({ description: 'Email address of the person making the inquiry' })
  email: string;

  @IsPhoneNumber('IN')
  @IsNotEmpty()
  @ApiProperty({ description: 'Phone number of the person making the inquiry' })
  phone: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Message content of the inquiry' })
  message?: string;

  @IsOptional()
  @IsEnum(InquirySource)
  @ApiPropertyOptional({ 
    enum: InquirySource, 
    default: InquirySource.contact_us,
    description: 'Source of the inquiry' 
  })
  source?: InquirySource;
} 