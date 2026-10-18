import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CouponDto } from '../../cart/dto/add-coupon.dto';

export class UpdateOrderPaymentModeDto {
  @IsEnum(PaymentMode)
  @ApiProperty({ description: 'Mode of payment for the order' })
  payment_mode: PaymentMode;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiProperty({
    required: false,
    description:
      'Set true after user confirms continuing when Delhivery serviceability is temporarily unavailable.',
  })
  acknowledge_unverified_pincode?: boolean;
}

export class UpdateOrderCouponDto extends PartialType(CouponDto) {}

export class UpdateOrderAddressDto {
  @IsMongoId()
  @ApiProperty({ description: 'Id of one of the addresses user has' })
  address_id: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiProperty({
    required: false,
    description:
      'Set true after user confirms continuing when Delhivery serviceability is temporarily unavailable.',
  })
  acknowledge_unverified_pincode?: boolean;
}
