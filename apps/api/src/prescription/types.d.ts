import { IWithTransactionClient } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create.dto';

interface ICreatePrescription extends IWithTransactionClient {
  createPrescriptionDto: Omit<CreatePrescriptionDto, 'image'>;
  user_id: string;
}
