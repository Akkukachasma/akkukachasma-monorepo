import { PartialType } from '@nestjs/swagger';
import { CreateLensFeatureDto } from './create-lens-feature.dto';

export class UpdateLensFeatureDto extends PartialType(CreateLensFeatureDto) {}
