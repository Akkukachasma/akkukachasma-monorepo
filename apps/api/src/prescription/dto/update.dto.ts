import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create.dto';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}
