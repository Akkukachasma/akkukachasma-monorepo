import { PartialType } from '@nestjs/swagger';
import { CreatePowerTypeDto } from './create-power-type.dto';

export class UpdatePowerTypeDto extends PartialType(CreatePowerTypeDto) {}
