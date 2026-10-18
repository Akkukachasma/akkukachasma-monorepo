import { IsEmail, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  phone_number?: string;

  @IsBoolean()
  @ApiProperty()
  agree_t_and_c: boolean;

  @IsString()
  @ApiProperty({ description: 'Password for the user' })
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, description: 'Role IDs to assign. Defaults to customer role if empty.' })
  role_ids?: string[];
} 