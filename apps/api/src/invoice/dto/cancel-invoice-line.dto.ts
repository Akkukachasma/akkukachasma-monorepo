import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelInvoiceLineDto {
  @ApiPropertyOptional({ description: 'Optional reason for audit trail' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
