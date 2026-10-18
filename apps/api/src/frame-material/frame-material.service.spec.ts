import { Test, TestingModule } from '@nestjs/testing';
import { FrameMaterialService } from './frame-material.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FrameMaterialService', () => {
  let service: FrameMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FrameMaterialService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<FrameMaterialService>(FrameMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
