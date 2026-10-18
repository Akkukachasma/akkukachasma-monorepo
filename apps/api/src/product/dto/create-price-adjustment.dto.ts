import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PriceAdjustmentDirection,
  PriceAdjustmentMode,
} from '@prisma/client';

@ValidatorConstraint({ name: 'priceAdjustmentValueBounds', async: false })
class PriceAdjustmentValueBounds implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      return false;
    }
    const obj = args.object as CreatePriceAdjustmentDto;
    if (obj.mode === PriceAdjustmentMode.percentage) {
      return value <= 100;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const obj = args.object as CreatePriceAdjustmentDto;
    if (obj.mode === PriceAdjustmentMode.percentage) {
      return 'Percentage value must be greater than 0 and at most 100';
    }
    return 'Fixed value must be greater than 0';
  }
}

export class CreatePriceAdjustmentDto {
  @ApiProperty({ enum: PriceAdjustmentDirection })
  @IsEnum(PriceAdjustmentDirection)
  direction!: PriceAdjustmentDirection;

  @ApiProperty({ enum: PriceAdjustmentMode })
  @IsEnum(PriceAdjustmentMode)
  mode!: PriceAdjustmentMode;

  @ApiProperty({
    description:
      'Percentage (0 < value ≤ 100) or fixed amount in INR (value > 0). Negatives not allowed.',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000)
  @Validate(PriceAdjustmentValueBounds)
  value!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
