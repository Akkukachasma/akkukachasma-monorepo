import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { createMockCacheService } from '../test/mock-cache.service';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        { provide: PrismaService, useValue: {} },
        { provide: CacheService, useValue: createMockCacheService() },
      ],
    }).compile();

    service = module.get<BannerService>(BannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
