import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSearchSuggestionsDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Search query for product suggestions (min 2 characters)',
    example: 'ray',
  })
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  @ApiPropertyOptional({
    description: 'Max number of suggestions to return',
    default: 10,
    minimum: 1,
    maximum: 20,
  })
  limit?: number = 10;
}
