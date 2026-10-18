import { IsOptional, IsBoolean, IsArray, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  agree_t_and_c?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, description: 'Role IDs to assign. Replaces existing roles.' })
  role_ids?: string[];
} 