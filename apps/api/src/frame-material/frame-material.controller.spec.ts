import { Test, TestingModule } from '@nestjs/testing';
import { FrameMaterialController } from './frame-material.controller';
import { FrameMaterialService } from './frame-material.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('FrameMaterialController', () => {
  let controller: FrameMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrameMaterialController],
      providers: [
        FrameMaterialService,
        { provide: PrismaService, useValue: {} },
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

    controller = module.get<FrameMaterialController>(FrameMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
