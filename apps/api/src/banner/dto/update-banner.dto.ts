import { PartialType } from '@nestjs/swagger';
import { CreateBannerDto } from './create-banner.dto';
import { IsArray, IsInt, IsMongoId, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class BannerOrderDto {
  @IsMongoId()
  @ApiProperty({ description: 'Banner ID' })
  id: string;

  @IsInt()
  @ApiProperty({ description: 'New order (whole number)' })
  order: number;
}
// nigahen milane ko jee chahta hai
// ho ram ji bada dukh deena
export class UpdateBannerOrderDto {
  @ApiProperty({ description: 'Array of OrderDto to update the order with' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerOrderDto)
  new_orders: BannerOrderDto[];
}
