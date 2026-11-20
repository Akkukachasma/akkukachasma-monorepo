import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';

export class SendPhoneOtpDto {
  @IsNumberString()
  @Length(10, 10)
  @ApiProperty({ description: '10-digit Indian mobile number', example: '9876543210' })
  phone_number: string;
}

export class VerifyPhoneOtpDto {
  @IsNumberString()
  @Length(10, 10)
  @ApiProperty({ description: '10-digit Indian mobile number', example: '9876543210' })
  phone_number: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({ description: '6-digit OTP', example: '123456' })
  otp: string;
}
