import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { PrescriptionController } from './prescription.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FileModule } from '../file/file.module';

@Module({
  imports: [FileModule],
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrismaService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
