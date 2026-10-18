import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @ApiProperty({
    description:
      'WhatsApp / mobile number (10-digit Indian mobile, or with country code 91)',
    example: '9876543210',
  })
  @IsString()
  @MinLength(10)
  number: string;
}
