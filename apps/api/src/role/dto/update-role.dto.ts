import { IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  permission_ids?: string[];
}
