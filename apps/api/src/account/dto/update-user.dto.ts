import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsPhoneNumber('IN')
  @ApiProperty({ description: "User's phone number", example: '8850593776' })
  phone_number?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "User's full name", example: 'John Doe' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Id of uploaded avatar image.' })
  avatar?: string;
}

export class UpdatePasswordDto {
  @IsString()
  @ApiProperty({ description: 'Current password', example: 'password' })
  current_password: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({ description: 'New password', example: 'new_password' })
  new_password: string;
}
