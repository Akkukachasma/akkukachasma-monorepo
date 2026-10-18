import { Test, TestingModule } from '@nestjs/testing';
import { LensFeatureController } from './lens-feature.controller';
import { LensFeatureService } from './lens-feature.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PowerTypeService } from '../power-type/power-type.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('LensFeatureController', () => {
  let controller: LensFeatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LensFeatureController],
      providers: [
        LensFeatureService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: PowerTypeService, useValue: {} },
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

    controller = module.get<LensFeatureController>(LensFeatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
