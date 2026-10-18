import { Test, TestingModule } from '@nestjs/testing';
import { LensDetailController } from './lens-detail.controller';
import { LensDetailService } from './lens-detail.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { LensFeatureService } from '../lens-feature/lens-feature.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('LensDetailController', () => {
  let controller: LensDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LensDetailController],
      providers: [
        LensDetailService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: LensFeatureService, useValue: {} },
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

    controller = module.get<LensDetailController>(LensDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
