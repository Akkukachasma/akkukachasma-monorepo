import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreatePrescriptionDto } from '../../prescription/dto/create.dto';

export class AddProductToCartDto {
  @IsMongoId()
  @ApiProperty({ description: 'Product color id.' })
  product_color_id: string;

  @ValidateIf((o) => !o.frame_only)
  @IsMongoId()
  @ApiPropertyOptional({ description: 'Lens detail id. Required when not frame only.' })
  lens_detail_id?: string;

  @ValidateIf((o) => !o.frame_only)
  @IsMongoId()
  @ApiPropertyOptional({ description: 'Lens feature id. Required when not frame only.' })
  lens_feature_id?: string;

  @ValidateIf((o) => !o.frame_only)
  @IsMongoId()
  @ApiPropertyOptional({ description: 'Power type id. Required when not frame only.' })
  power_type_id?: string;

  @IsBoolean()
  @ApiProperty({ description: 'Whether the product is frame only or not.' })
  frame_only: boolean;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether to save this prescription for future usage.',
  })
  save_prescription: boolean;

  @ValidateIf((o) => !o.frame_only)
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePrescriptionDto)
  @ApiPropertyOptional({ description: 'Prescription details. Required when not frame only.' })
  prescription?: CreatePrescriptionDto;
}
