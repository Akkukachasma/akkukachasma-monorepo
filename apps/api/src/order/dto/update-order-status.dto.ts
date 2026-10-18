import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status for the order',
    enum: OrderStatus,
    example: 'confirmed',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Optional remark for the status change',
    example: 'Order confirmed after payment verification',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
} 