import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CouponDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @ApiProperty({ description: 'Coupon code for the offer.', example: 'SAVE10' })
  coupon_code: string;
}
