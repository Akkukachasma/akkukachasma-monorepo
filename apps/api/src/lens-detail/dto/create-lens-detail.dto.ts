import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLensDetailDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty({ description: 'Id of uploaded image.' })
  image?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  lens_feature_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lens_id: string;

  @IsNumber()
  @Min(0.001)
  @ApiProperty()
  price: number;

  @IsNumber()
  @Min(0.001)
  @ApiProperty()
  thickness: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  power_range?: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ required: false, default: 0 })
  warranty_period?: number;

  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  blue_light_blocker?: boolean;

  @IsNumber()
  @Min(0)
  @ApiProperty({ required: false, default: 0 })
  crack_resistant?: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ required: false, default: 0 })
  hydrophobic?: number;

  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  anti_reflection?: boolean;

  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  uv_protection?: boolean;
}
