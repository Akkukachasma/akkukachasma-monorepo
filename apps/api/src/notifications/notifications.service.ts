import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeliveryChannel,
  DeliveryStatus,
  NotificationAudience,
  NotificationType,
  NotificationCategory,
  NotificationSeverity,
  Prisma,
  Notification as PrismaNotification,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationListItem = {
  id: string;
  type: string;
  category: string;
  severity: string;
  title: string;
  body: string | null;
  message: string | null;
  data: unknown;
  readAt: string | null;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  toDto(n: PrismaNotification): NotificationListItem {
    return {
      id: n.id,
      type: n.type,
      category: n.category,
      severity: n.severity,
      title: n.title,
      body: n.body,
      message: n.body,
      data: n.data,
      readAt: n.read_at ? n.read_at.toISOString() : null,
      isRead: !!n.read_at,
      timestamp: n.created_at.toISOString(),
      createdAt: n.created_at.toISOString(),
      entityType: n.entity_type,
      entityId: n.entity_id,
    };
  }

  async listForUser(params: {
    userId: string;
    audience: NotificationAudience;
    unreadOnly?: boolean;
    take?: number;
    skip?: number;
  }): Promise<{ items: NotificationListItem[]; total: number }> {
    const take = Math.min(params.take ?? 30, 100);
    const skip = params.skip ?? 0;
    const where: Prisma.NotificationWhereInput = {
      user_id: params.userId,
      audience: params.audience,
      ...(params.unreadOnly ? { read_at: null } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take,
        skip,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items: rows.map((r) => this.toDto(r)), total };
  }

  async unreadCount(userId: string, audience: NotificationAudience): Promise<number> {
    return this.prisma.notification.count({
      where: { user_id: userId, audience, read_at: null },
    });
  }

  async markRead(userId: string, audience: NotificationAudience, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, user_id: userId, audience },
    });
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read_at: new Date() },
    });
    return this.toDto(updated);
  }

  async markAllRead(userId: string, audience: NotificationAudience) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, audience, read_at: null },
      data: { read_at: new Date() },
    });
    return { success: true as const };
  }

  /**
   * Persist notification + delivery rows, return created notification.
   * Does not send email or WS (see NotificationsDispatchService).
   */
  async createNotificationRecord(input: {
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
    channels: Array<'IN_APP' | 'EMAIL'>;
  }) {
    return this.prisma.notification.create({
      data: {
        user_id: input.userId,
        audience: input.audience,
        type: input.type,
        category: input.category,
        severity: input.severity ?? 'LOW',
        title: input.title,
        body: input.body ?? null,
        data: input.data,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        deliveries: {
          create: input.channels.map((channel) => ({
            channel: channel as DeliveryChannel,
            status: DeliveryStatus.PENDING,
          })),
        },
      },
      include: { deliveries: true },
    });
  }
}
