import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionService } from './prescription.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';

describe('PrescriptionService', () => {
  let service: PrescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: { update: jest.fn() } },
      ],
    }).compile();

    service = module.get<PrescriptionService>(PrescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
