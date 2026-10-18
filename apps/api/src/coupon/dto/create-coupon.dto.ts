import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsPositive,
  MaxLength,
  MinLength,
  ValidateIf,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';
import custom_dayjs from '../../../lib/custom-dayjs';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Unique name for the coupon',
    example: 'SUMMER2024',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Minimum order amount required to apply this coupon',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  minimum_order: number;

  @ApiPropertyOptional({
    description: 'Maximum number of times a single user can use this coupon',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  per_user_limit?: number;

  @ApiPropertyOptional({
    description: 'Date from which the coupon becomes valid',
    default: 'current date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @Transform(({ value }: { value: string }) =>
    value
      ? custom_dayjs.tz(value, 'Asia/Kolkata').startOf('day').toISOString()
      : value,
  )
  @IsOptional()
  valid_from?: string;

  @ApiPropertyOptional({
    description:
      'Date until which the coupon remains valid. If not set, coupon never expires',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value
      ? custom_dayjs.tz(value, 'Asia/Kolkata').endOf('day').toISOString()
      : value,
  )
  valid_till?: string;

  @ApiPropertyOptional({
    description:
      'Maximum number of times this coupon can be availed globally. Omit or null for unlimited. 0 is treated as unlimited.',
    default: null,
    minimum: 0,
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }: { value: unknown }) => {
    if (value === 0 || value === '0' || value === null || value === '') {
      return null;
    }
    return value;
  })
  quantity?: number | null;

  @ApiPropertyOptional({
    description: 'Type of discount to be applied',
    enum: DiscountType,
    default: DiscountType.FIXED,
    example: DiscountType.FIXED,
  })
  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @ApiProperty({
    description: 'Discount value (amount for FIXED, percentage for PERCENT)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @ValidateIf((o) => o.discount_type === DiscountType.PERCENT)
  @Max(100)
  @IsNumber()
  @IsPositive()
  discount_value: number;
}
