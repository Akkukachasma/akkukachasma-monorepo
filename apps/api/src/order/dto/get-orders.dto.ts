import { ApiProperty } from '@nestjs/swagger';
import { PaginateQueryDto } from '../../prisma/dto/paginate.dto';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { SORT_BY_DEFAULTS } from '../../../lib/constants';
import { OrderStatus, PaymentMode, PaymentStatus } from '@prisma/client';

export const ORDER_SEARCH_TYPES = [
  'phone',
  'orderId',
  'paymentId',
  'transactionId',
  'generic',
] as const;

export type OrderSearchType = (typeof ORDER_SEARCH_TYPES)[number];

export class GetAllOrdersDto extends PaginateQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search_term?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsIn(ORDER_SEARCH_TYPES)
  @ApiProperty({ required: false, enum: ORDER_SEARCH_TYPES })
  type?: OrderSearchType;

  @IsOptional()
  @IsString()
  @IsIn(SORT_BY_DEFAULTS)
  @ApiProperty({ required: false })
  sort_by?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  @ApiProperty({ required: false, enum: OrderStatus })
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  @ApiProperty({ required: false, enum: PaymentStatus })
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMode)
  @ApiProperty({ required: false, enum: PaymentMode })
  payment_mode?: PaymentMode;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  start_date?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  end_date?: string;
}
