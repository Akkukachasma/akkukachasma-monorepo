import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Manager' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Can manage team and orders' })
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: 'Permission IDs to assign' })
  permission_ids: string[];
}
