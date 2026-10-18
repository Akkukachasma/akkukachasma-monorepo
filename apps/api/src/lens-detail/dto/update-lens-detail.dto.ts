import { PartialType } from '@nestjs/swagger';
import { CreateLensDetailDto } from './create-lens-detail.dto';

export class UpdateLensDetailDto extends PartialType(CreateLensDetailDto) {}
