import { Test, TestingModule } from '@nestjs/testing';
import { PowerTypeController } from './power-type.controller';
import { PowerTypeService } from './power-type.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('PowerTypeController', () => {
  let controller: PowerTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerTypeController],
      providers: [
        PowerTypeService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
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

    controller = module.get<PowerTypeController>(PowerTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
