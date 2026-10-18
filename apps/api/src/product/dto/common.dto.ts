import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequiredIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}

export class GetProductsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
