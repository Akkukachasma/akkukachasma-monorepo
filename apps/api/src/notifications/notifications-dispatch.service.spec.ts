import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationAudience,
  NotificationCategory,
  NotificationSeverity,
  NotificationType,
} from '@prisma/client';
import { NotificationsDispatchService } from './notifications-dispatch.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RbacService } from '../rbac/services/rbac.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

describe('NotificationsDispatchService', () => {
  let service: NotificationsDispatchService;
  let rbac: { getUserIdsWithRoleCode: jest.Mock };
  let dispatchToUser: jest.SpyInstance;

  beforeEach(async () => {
    rbac = {
      getUserIdsWithRoleCode: jest.fn(async (code: string) => {
        if (code === 'admin') return ['admin-1', 'admin-2'];
        if (code === 'staff') return ['staff-1', 'admin-1'];
        return [];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsDispatchService,
        { provide: PrismaService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: RbacService, useValue: rbac },
        { provide: NotificationsGateway, useValue: {} },
        {
          provide: NotificationsService,
          useValue: {
            createNotificationRecord: jest.fn(),
            toDto: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsDispatchService);
    dispatchToUser = jest
      .spyOn(service, 'dispatchToUser')
      .mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('notifyPortalUsers', () => {
    it('merges admin+staff, excludes excludeUserId, dispatches with admin audience', async () => {
      await service.notifyPortalUsers({
        type: NotificationType.ADMIN_ACTIVITY,
        category: NotificationCategory.system,
        title: 'Hello',
        body: 'Body',
        data: { foo: 1 },
        excludeUserId: 'admin-1',
      });

      expect(rbac.getUserIdsWithRoleCode).toHaveBeenCalledWith('admin');
      expect(rbac.getUserIdsWithRoleCode).toHaveBeenCalledWith('staff');
      expect(dispatchToUser).toHaveBeenCalledTimes(2);
      expect(dispatchToUser.mock.calls.map((c) => c[0].userId).sort()).toEqual([
        'admin-2',
        'staff-1',
      ]);
      for (const [input] of dispatchToUser.mock.calls) {
        expect(input).toEqual(
          expect.objectContaining({
            audience: NotificationAudience.admin,
            type: NotificationType.ADMIN_ACTIVITY,
            category: NotificationCategory.system,
            title: 'Hello',
            body: 'Body',
            data: { foo: 1 },
          }),
        );
      }
    });
  });

  describe('notifyResourceMutation', () => {
    it('uses RESOURCE_MUTATION and excludes actorId', async () => {
      const notifyPortalUsers = jest
        .spyOn(service, 'notifyPortalUsers')
        .mockResolvedValue(undefined);

      await service.notifyResourceMutation({
        actorId: 'actor-9',
        action: 'updated',
        entityLabel: 'Brand',
        entityType: 'Brand',
        entityId: 'brand-1',
        summary: 'Renamed brand',
      });

      expect(notifyPortalUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.RESOURCE_MUTATION,
          category: NotificationCategory.system,
          severity: NotificationSeverity.LOW,
          title: 'Brand updated',
          body: 'Renamed brand',
          entityType: 'Brand',
          entityId: 'brand-1',
          excludeUserId: 'actor-9',
          data: expect.objectContaining({
            action: 'updated',
            actorId: 'actor-9',
            entityId: 'brand-1',
          }),
        }),
      );
    });
  });

  describe('notifyAdminsNewOrder', () => {
    it('notifies portal users with ORDER_PLACED and no exclude', async () => {
      const notifyPortalUsers = jest
        .spyOn(service, 'notifyPortalUsers')
        .mockResolvedValue(undefined);

      await service.notifyAdminsNewOrder({
        id: 'order-1',
        user: { id: 'customer-1' },
      });

      expect(notifyPortalUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.ORDER_PLACED,
          category: NotificationCategory.order,
          severity: NotificationSeverity.MEDIUM,
          title: 'New order confirmed',
          body: 'Order order-1 was confirmed.',
          entityType: 'Order',
          entityId: 'order-1',
          data: { orderId: 'order-1' },
        }),
      );
      expect(notifyPortalUsers.mock.calls[0][0].excludeUserId).toBeUndefined();
    });
  });
});
