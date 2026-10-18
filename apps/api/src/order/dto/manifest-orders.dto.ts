import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class ManifestOrdersDto {
  @ApiProperty({
    description: 'Order IDs to manifest with Delhivery (Ready To Ship)',
    type: [String],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  order_ids: string[];
}
