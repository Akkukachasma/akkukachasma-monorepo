import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class StreamCompleteDto {
  @ApiProperty()
  @IsMongoId()
  uploadId: string;
}
