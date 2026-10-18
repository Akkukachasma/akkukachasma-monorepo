import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UploadIdRouteParamDto {
  @ApiProperty()
  @IsMongoId()
  uploadId: string;
}
