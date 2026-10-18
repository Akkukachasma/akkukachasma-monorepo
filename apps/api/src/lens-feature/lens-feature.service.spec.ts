import { Test, TestingModule } from '@nestjs/testing';
import { LensFeatureService } from './lens-feature.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LensFeatureService', () => {
  let service: LensFeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LensFeatureService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<LensFeatureService>(LensFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
