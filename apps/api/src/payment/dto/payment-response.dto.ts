import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';

export class PaymentPrefillDto {
  @ApiProperty({ description: 'Customer name for prefilling' })
  name: string;

  @ApiProperty({ description: 'Customer email for prefilling' })
  email: string;

  @ApiProperty({ description: 'Customer phone for prefilling' })
  contact: string;
}

export class PaymentThemeDto {
  @ApiProperty({ description: 'Theme color for payment gateway' })
  color: string;
}

export class PaymentGatewayDataDto {
  @ApiProperty({ description: 'Razorpay order ID' })
  order_id: string;

  @ApiProperty({ description: 'Amount in paise (smallest currency unit)' })
  amount: number;

  @ApiProperty({ description: 'Payment currency' })
  currency: string;

  @ApiProperty({ description: 'Merchant name' })
  name: string;

  @ApiProperty({ description: 'Order description' })
  description: string;

  @ApiProperty({ description: 'Razorpay public key' })
  key: string;

  @ApiProperty({ description: 'Payment mode' })
  mode: PaymentMode;

  @ApiProperty({
    description: 'Prefilled customer data',
    type: PaymentPrefillDto,
  })
  prefill: PaymentPrefillDto;

  @ApiProperty({ description: 'Payment gateway theme', type: PaymentThemeDto })
  theme: PaymentThemeDto;
}
