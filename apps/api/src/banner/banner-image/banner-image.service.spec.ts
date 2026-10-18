import { Test, TestingModule } from '@nestjs/testing';
import { BannerImageService } from './banner-image.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { createMockCacheService } from '../../test/mock-cache.service';

describe('BannerImageService', () => {
  let service: BannerImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerImageService,
        { provide: PrismaService, useValue: {} },
        { provide: CacheService, useValue: createMockCacheService() },
      ],
    }).compile();

    service = module.get<BannerImageService>(BannerImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
