import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from './brand.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BrandService', () => {
  let service: BrandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
