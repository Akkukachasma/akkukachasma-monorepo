import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationCategory,
  NotificationSeverity,
  NotificationType,
} from '@prisma/client';
import { ActivityLoggerService } from './activity-logger.service';
import { ActivityService } from './activity.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('ActivityLoggerService', () => {
  let service: ActivityLoggerService;
  let activityCreate: jest.Mock;
  let notifyPortalUsers: jest.Mock;

  const flush = () => new Promise((r) => setImmediate(r));

  beforeEach(async () => {
    activityCreate = jest.fn().mockResolvedValue({});
    notifyPortalUsers = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLoggerService,
        { provide: ActivityService, useValue: { create: activityCreate } },
        {
          provide: NotificationsDispatchService,
          useValue: { notifyPortalUsers },
        },
      ],
    }).compile();

    service = module.get(ActivityLoggerService);
  });

  it('notifies portal for significant payment/order activity with ADMIN_ACTIVITY', async () => {
    service.logSuccess(
      'Payment captured',
      'Paid online',
      { source: 'payment', order_id: 'ord-1' },
      'user-actor',
    );

    await flush();

    expect(activityCreate).toHaveBeenCalled();
    expect(notifyPortalUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.ADMIN_ACTIVITY,
        category: NotificationCategory.payment,
        severity: NotificationSeverity.LOW,
        title: 'Payment captured',
        body: 'Paid online',
        entityType: 'Order',
        entityId: 'ord-1',
        excludeUserId: 'user-actor',
      }),
    );
  });

  it('does not notify for auth or cart sources', async () => {
    service.logInfo('Login', 'ok', { source: 'auth' }, 'u1');
    service.logInfo('Cart updated', 'ok', { source: 'cart' }, 'u1');
    await flush();

    expect(activityCreate).toHaveBeenCalledTimes(2);
    expect(notifyPortalUsers).not.toHaveBeenCalled();
  });

  it('skips notify for dedicated order payment titles', async () => {
    service.logSuccess('Payment: COD order confirmed', 'x', {
      source: 'payment',
    });
    service.logSuccess('Order: payment completed', 'y', { source: 'order' });
    await flush();

    expect(notifyPortalUsers).not.toHaveBeenCalled();
  });

  it('notifies for delhivery ERROR/WARNING but not SUCCESS track', async () => {
    service.logError('Delhivery Track API', 'boom', {
      source: 'delhivery_track',
    });
    service.logWarning('Delhivery Track API', 'slow', {
      source: 'delhivery_track',
    });
    service.logSuccess('Delhivery Track API', 'ok', {
      source: 'delhivery_track',
    });
    await flush();

    expect(notifyPortalUsers).toHaveBeenCalledTimes(2);
    expect(notifyPortalUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.ADMIN_ACTIVITY,
        category: NotificationCategory.system,
        severity: NotificationSeverity.HIGH,
        title: 'Delhivery Track API',
      }),
    );
    expect(notifyPortalUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: NotificationSeverity.MEDIUM,
      }),
    );
  });

  it('passes excludeUserId when user_id is present', async () => {
    service.logWarning(
      'Invoice warning',
      'tax mismatch',
      { source: 'invoice', invoice_id: 'inv-9' },
      'staff-42',
    );
    await flush();

    expect(notifyPortalUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeUserId: 'staff-42',
        entityType: 'Invoice',
        entityId: 'inv-9',
        category: NotificationCategory.system,
      }),
    );
  });
});
