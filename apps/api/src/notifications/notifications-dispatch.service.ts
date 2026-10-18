import { Injectable, Logger } from '@nestjs/common';
import {
  DeliveryChannel,
  DeliveryStatus,
  Notification,
  NotificationAudience,
  NotificationCategory,
  NotificationSeverity,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RbacService } from '../rbac/services/rbac.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

type OrderLike = {
  id: string;
  user?: { id: string; email?: string | null; name?: string | null } | null;
};

@Injectable()
export class NotificationsDispatchService {
  private readonly logger = new Logger(NotificationsDispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly rbac: RbacService,
    private readonly gateway: NotificationsGateway,
    private readonly notifications: NotificationsService,
  ) {}

  private async channelPrefs(userId: string): Promise<{ email: boolean; inApp: boolean }> {
    const setting = await this.prisma.setting.findUnique({
      where: { user_id: userId },
      include: { notification: true },
    });
    return {
      email: setting?.notification?.email ?? true,
      inApp: setting?.notification?.in_app ?? true,
    };
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildEmailHtml(title: string, body: string | null | undefined): string {
    const safeTitle = this.escapeHtml(title);
    const safeBody = body ? `<p>${this.escapeHtml(body)}</p>` : '';
    return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">
<h2 style="margin:0 0 12px">${safeTitle}</h2>${safeBody}
<p style="color:#666;font-size:12px;margin-top:24px">Akku Ka Chasma</p>
</body></html>`;
  }

  private async deliverInApp(
    notificationId: string,
    userId: string,
    payload: ReturnType<NotificationsService['toDto']>,
  ) {
    const delivery = await this.prisma.notificationDelivery.findFirst({
      where: { notification_id: notificationId, channel: DeliveryChannel.IN_APP },
    });
    if (!delivery) return;
    try {
      this.gateway.emitToUser(userId, 'notification:new', payload);
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          sent_at: new Date(),
          delivered_at: new Date(),
        },
      });
    } catch (e: any) {
      this.logger.warn(`IN_APP delivery failed ${notificationId}: ${e?.message}`);
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.FAILED,
          failed_at: new Date(),
          attempt_count: { increment: 1 },
        },
      });
    }
  }

  private async deliverEmail(
    notificationId: string,
    to: string,
    subject: string,
    title: string,
    body: string | null | undefined,
  ) {
    const delivery = await this.prisma.notificationDelivery.findFirst({
      where: { notification_id: notificationId, channel: DeliveryChannel.EMAIL },
    });
    if (!delivery) return;
    try {
      const html = this.buildEmailHtml(title, body);
      const messageId = await this.mail.sendSimpleHtml(to, subject, html);
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          sent_at: new Date(),
          delivered_at: new Date(),
          provider_message_id: messageId ?? null,
        },
      });
    } catch (e: any) {
      this.logger.error(`EMAIL delivery failed ${notificationId}: ${e?.message}`);
      await this.prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.FAILED,
          failed_at: new Date(),
          attempt_count: { increment: 1 },
        },
      });
    }
  }

  async dispatchToUser(input: {
    userId: string;
    audience: NotificationAudience;
    type: NotificationType;
    category: NotificationCategory;
    severity?: NotificationSeverity;
    title: string;
    body?: string | null;
    data: Prisma.InputJsonValue;
    entityType?: string | null;
    entityId?: string | null;
  }) {
    const prefs = await this.channelPrefs(input.userId);
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });
    const channels: Array<'IN_APP' | 'EMAIL'> = [];
    if (prefs.inApp) channels.push('IN_APP');
    if (prefs.email && user?.email) channels.push('EMAIL');
    if (channels.length === 0) {
      return null;
    }

    const created = await this.notifications.createNotificationRecord({
      userId: input.userId,
      audience: input.audience,
      type: input.type,
      category: input.category,
      severity: input.severity,
      title: input.title,
      body: input.body,
      data: input.data,
      entityType: input.entityType,
      entityId: input.entityId,
      channels,
    });

    const dto = this.notifications.toDto(created as Notification);

    if (channels.includes('IN_APP')) {
      void this.deliverInApp(created.id, input.userId, dto);
    }
    if (channels.includes('EMAIL') && user?.email) {
      void this.deliverEmail(
        created.id,
        user.email,
        input.title,
        input.title,
        input.body,
      );
    }

    return created;
  }

  /** Portal operators: admin + staff role codes. */
  private async portalRecipientIds(excludeUserId?: string | null): Promise<string[]> {
    const [adminIds, staffIds] = await Promise.all([
      this.rbac.getUserIdsWithRoleCode('admin'),
      this.rbac.getUserIdsWithRoleCode('staff'),
    ]);
    const unique = [...new Set([...adminIds, ...staffIds])];
    if (!excludeUserId) return unique;
    return unique.filter((id) => id !== excludeUserId);
  }

  /**
   * Fan-out to portal users (admin + staff).
   * When `excludeUserId` is set (actor-driven), that user is skipped.
   * System/Delhivery events omit exclude and notify everyone.
   */
  async notifyPortalUsers(input: {
    type: NotificationType;
    category: NotificationCategory;
    severity?: NotificationSeverity;
    title: string;
    body?: string | null;
    data?: Prisma.InputJsonValue;
    entityType?: string | null;
    entityId?: string | null;
    excludeUserId?: string | null;
  }) {
    const recipients = await this.portalRecipientIds(input.excludeUserId);
    if (recipients.length === 0) return;
    await Promise.all(
      recipients.map((userId) =>
        this.dispatchToUser({
          userId,
          audience: NotificationAudience.admin,
          type: input.type,
          category: input.category,
          severity: input.severity,
          title: input.title,
          body: input.body,
          data: input.data ?? {},
          entityType: input.entityType,
          entityId: input.entityId,
        }),
      ),
    );
  }

  /** Manage create/update/delete — notify everyone except the actor. */
  async notifyResourceMutation(input: {
    actorId: string;
    action: 'created' | 'updated' | 'deleted';
    entityLabel: string;
    entityType: string;
    entityId?: string | null;
    summary?: string | null;
  }) {
    const title = `${input.entityLabel} ${input.action}`;
    const body =
      input.summary?.trim() ||
      `${input.entityLabel} was ${input.action} in the admin portal.`;
    await this.notifyPortalUsers({
      type: NotificationType.RESOURCE_MUTATION,
      category: NotificationCategory.system,
      severity: NotificationSeverity.LOW,
      title,
      body,
      data: {
        action: input.action,
        entityLabel: input.entityLabel,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        actorId: input.actorId,
      },
      entityType: input.entityType,
      entityId: input.entityId,
      excludeUserId: input.actorId,
    });
  }

  /** Customer: order confirmed / paid. */
  async notifyCustomerOrderConfirmed(order: OrderLike) {
    const userId = order.user?.id;
    if (!userId) return;
    await this.dispatchToUser({
      userId,
      audience: NotificationAudience.customer,
      type: NotificationType.ORDER_PLACED,
      category: NotificationCategory.order,
      severity: NotificationSeverity.MEDIUM,
      title: 'Order confirmed',
      body: `Your order ${order.id} has been confirmed. We will keep you updated.`,
      data: { orderId: order.id },
      entityType: 'Order',
      entityId: order.id,
    });
  }

  /** Admin workspace: new confirmed order (one row per portal user). */
  async notifyAdminsNewOrder(order: OrderLike) {
    await this.notifyPortalUsers({
      type: NotificationType.ORDER_PLACED,
      category: NotificationCategory.order,
      severity: NotificationSeverity.MEDIUM,
      title: 'New order confirmed',
      body: `Order ${order.id} was confirmed.`,
      data: { orderId: order.id },
      entityType: 'Order',
      entityId: order.id,
    });
  }

  /** Customer-only lifecycle updates (shipped / delivered). */
  async notifyCustomerOrderStatus(order: OrderLike, status: string) {
    const userId = order.user?.id;
    if (!userId) return;
    if (status === 'picked') {
      await this.dispatchToUser({
        userId,
        audience: NotificationAudience.customer,
        type: NotificationType.ORDER_SHIPPED,
        category: NotificationCategory.order,
        title: 'Order shipped',
        body: `Your order ${order.id} is on the way.`,
        data: { orderId: order.id, status },
        entityType: 'Order',
        entityId: order.id,
      });
    } else if (status === 'delivered') {
      await this.dispatchToUser({
        userId,
        audience: NotificationAudience.customer,
        type: NotificationType.ORDER_DELIVERED,
        category: NotificationCategory.order,
        title: 'Order delivered',
        body: `Your order ${order.id} has been delivered.`,
        data: { orderId: order.id, status },
        entityType: 'Order',
        entityId: order.id,
      });
    }
  }
}
