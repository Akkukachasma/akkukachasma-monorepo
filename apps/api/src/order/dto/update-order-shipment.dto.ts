import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MinLength } from 'class-validator';

export class UpdateOrderShipmentDto {
  @ApiProperty({
    description: 'Waybill number from Delhivery',
    example: 'DLV1234567890',
    required: true,
  })
  @IsString()
  @MinLength(5)
  waybill_number: string;

  @ApiProperty({
    description: 'Delivery partner name',
    example: 'Delhivery',
    required: false,
  })
  @IsOptional()
  @IsString()
  delivery_partner?: string;

  @ApiProperty({
    description: 'Estimated delivery date (ISO string)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  estimated_delivery?: string;
}
