import { PartialType } from '@nestjs/swagger';
import { CreateShapeDto } from './create-shape.dto';

export class UpdateShapeDto extends PartialType(CreateShapeDto) {}
