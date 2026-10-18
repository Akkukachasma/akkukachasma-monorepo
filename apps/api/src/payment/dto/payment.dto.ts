import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Razorpay order ID' })
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Razorpay payment ID' })
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Razorpay signature' })
  razorpay_signature: string;

  @IsMongoId()
  @ApiProperty({ description: 'Order id' })
  order_id: string;
}

export class MakePaymentDto {
  @IsMongoId()
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Additional notes' })
  notes?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiProperty({
    required: false,
    description:
      'Set true after user confirms paying when Delhivery serviceability is temporarily unavailable.',
  })
  acknowledge_unverified_pincode?: boolean;
}
