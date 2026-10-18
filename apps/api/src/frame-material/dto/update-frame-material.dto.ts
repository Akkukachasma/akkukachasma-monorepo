import { PartialType } from '@nestjs/swagger';
import { CreateFrameMaterialDto } from './create-frame-material.dto';

export class UpdateFrameMaterialDto extends PartialType(
  CreateFrameMaterialDto,
) {}
