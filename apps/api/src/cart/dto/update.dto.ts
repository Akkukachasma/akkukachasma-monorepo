import { IsNumber, Max, Min } from 'class-validator';

export class UpdateQuantityDto {
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(10, { message: 'Quantity must be at most 10' })
  quantity: number;
}
