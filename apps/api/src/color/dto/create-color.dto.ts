import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @ApiProperty()
  color: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
