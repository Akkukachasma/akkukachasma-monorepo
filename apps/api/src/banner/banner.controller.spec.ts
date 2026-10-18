import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { CacheService } from '../cache/cache.service';
import { createMockCacheService } from '../test/mock-cache.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('BannerController', () => {
  let controller: BannerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerController],
      providers: [
        BannerService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: CacheService, useValue: createMockCacheService() },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BannerController>(BannerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
