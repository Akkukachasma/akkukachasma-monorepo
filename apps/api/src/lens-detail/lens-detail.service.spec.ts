import { Test, TestingModule } from '@nestjs/testing';
import { LensDetailService } from './lens-detail.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LensDetailService', () => {
  let service: LensDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LensDetailService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<LensDetailService>(LensDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
