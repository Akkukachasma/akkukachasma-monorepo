import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationCategory,
  NotificationSeverity,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { ActivityService } from './activity.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

type ActivityTypeEnum = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING' | 'ALERT';

export interface LogDetail extends Record<string, unknown> {
  source?: string;
}

/** Titles that already fan out via dedicated order notifications. */
const SKIP_NOTIFY_TITLES = new Set([
  'Payment: COD order confirmed',
  'Order: payment completed',
]);

const BUSINESS_SOURCES = new Set([
  'order',
  'order_manifest',
  'payment',
  'invoice',
]);

const NEVER_NOTIFY_SOURCES = new Set([
  'auth',
  'cart',
  'file_cron',
  'token_cron',
]);

@Injectable()
export class ActivityLoggerService {
  private readonly logger = new Logger(ActivityLoggerService.name);

  constructor(
    private readonly activityService: ActivityService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  private log(
    type: ActivityTypeEnum,
    title: string,
    description?: string,
    detail?: LogDetail,
    user_id?: string,
  ): void {
    this.activityService
      .create({
        type,
        title,
        description: description ?? undefined,
        detail: (detail ?? {}) as Prisma.InputJsonValue,
        user_id,
      })
      .then(() => {
        this.maybeNotifyPortal(type, title, description, detail, user_id);
      })
      .catch((err) =>
        this.logger.warn(`Activity log failed for ${title}: ${err?.message}`),
      );
  }

  private maybeNotifyPortal(
    type: ActivityTypeEnum,
    title: string,
    description?: string,
    detail?: LogDetail,
    user_id?: string,
  ): void {
    if (!this.shouldNotify(type, title, detail)) return;

    const source = typeof detail?.source === 'string' ? detail.source : '';
    const category = this.categoryForSource(source);
    const severity = this.severityForActivity(type);
    const { entityType, entityId } = this.entityFromDetail(detail);

    void this.notificationsDispatch
      .notifyPortalUsers({
        type: NotificationType.ADMIN_ACTIVITY,
        category,
        severity,
        title,
        body: description ?? null,
        data: {
          source: source || null,
          activityType: type,
          ...(detail ?? {}),
        },
        entityType,
        entityId,
        excludeUserId: user_id ?? null,
      })
      .catch((err) =>
        this.logger.warn(
          `Portal notify failed for activity "${title}": ${err?.message}`,
        ),
      );
  }

  private shouldNotify(
    type: ActivityTypeEnum,
    title: string,
    detail?: LogDetail,
  ): boolean {
    if (SKIP_NOTIFY_TITLES.has(title)) return false;

    const source = typeof detail?.source === 'string' ? detail.source : '';
    if (!source || NEVER_NOTIFY_SOURCES.has(source)) return false;

    if (BUSINESS_SOURCES.has(source)) return true;

    if (source.startsWith('delhivery_')) {
      if (type === 'ERROR' || type === 'WARNING') return true;
      const lower = title.toLowerCase();
      return lower.includes('failed') || lower.includes('rejected');
    }

    if (source === 'http_exception') {
      const status = Number(detail?.status);
      return Number.isFinite(status) && status >= 500;
    }

    return false;
  }

  private categoryForSource(source: string): NotificationCategory {
    if (source === 'order' || source === 'order_manifest') {
      return NotificationCategory.order;
    }
    if (source === 'payment') return NotificationCategory.payment;
    return NotificationCategory.system;
  }

  private severityForActivity(type: ActivityTypeEnum): NotificationSeverity {
    switch (type) {
      case 'ERROR':
      case 'ALERT':
        return NotificationSeverity.HIGH;
      case 'WARNING':
        return NotificationSeverity.MEDIUM;
      default:
        return NotificationSeverity.LOW;
    }
  }

  private entityFromDetail(detail?: LogDetail): {
    entityType?: string;
    entityId?: string;
  } {
    if (!detail) return {};
    if (typeof detail.order_id === 'string' && detail.order_id) {
      return { entityType: 'Order', entityId: detail.order_id };
    }
    if (typeof detail.invoice_id === 'string' && detail.invoice_id) {
      return { entityType: 'Invoice', entityId: detail.invoice_id };
    }
    return {};
  }

  logError(title: string, description?: string, detail?: LogDetail, user_id?: string): void {
    this.log('ERROR', title, description, detail, user_id);
  }

  logSuccess(title: string, description?: string, detail?: LogDetail, user_id?: string): void {
    this.log('SUCCESS', title, description, detail, user_id);
  }

  logWarning(title: string, description?: string, detail?: LogDetail, user_id?: string): void {
    this.log('WARNING', title, description, detail, user_id);
  }

  logInfo(title: string, description?: string, detail?: LogDetail, user_id?: string): void {
    this.log('INFO', title, description, detail, user_id);
  }

  logAlert(title: string, description?: string, detail?: LogDetail, user_id?: string): void {
    this.log('ALERT', title, description, detail, user_id);
  }
}
