import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DelhiveryService } from '../delhivery/delhivery.service';
import { OrderService } from './order.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ActivityLoggerService } from '../activity/activity-logger.service';

const MANIFEST_CONCURRENCY = 5;
const MAX_ATTEMPTS = 3;
const ELIGIBLE_STATUSES: OrderStatus[] = [
  OrderStatus.confirmed,
  OrderStatus.picked,
];

export type ManifestProgressStatus =
  | 'attempting'
  | 'success'
  | 'failed'
  | 'skipped';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableManifestError(err: unknown): boolean {
  const e = err as {
    response?: { status?: number };
    code?: string;
    message?: string;
  };
  const status = e?.response?.status;
  if (typeof status === 'number' && status >= 500) return true;
  if (
    e?.code &&
    ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN'].includes(
      e.code,
    )
  ) {
    return true;
  }
  const msg = (e?.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('network error')) return true;
  return false;
}

@Injectable()
export class OrderManifestService {
  private readonly logger = new Logger(OrderManifestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly delhiveryService: DelhiveryService,
    private readonly orderService: OrderService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  startManifestJob({
    orderIds,
    adminUserId,
  }: {
    orderIds: string[];
    adminUserId: string;
  }): { job_id: string; accepted: number } {
    const uniqueIds = [...new Set(orderIds)];
    const jobId = randomUUID();

    setImmediate(() => {
      void this.runJob(jobId, uniqueIds, adminUserId);
    });

    return { job_id: jobId, accepted: uniqueIds.length };
  }

  private emit(
    adminUserId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.notificationsGateway.emitToUser(adminUserId, event, payload);
  }

  private async runJob(
    jobId: string,
    orderIds: string[],
    adminUserId: string,
  ) {
    const counts = { success: 0, failed: 0, skipped: 0 };
    this.emit(adminUserId, 'orders:manifest:started', {
      job_id: jobId,
      total: orderIds.length,
    });

    let index = 0;
    const workers = Array.from(
      { length: Math.min(MANIFEST_CONCURRENCY, orderIds.length) },
      async () => {
        while (index < orderIds.length) {
          const orderId = orderIds[index++];
          const result = await this.manifestOne(jobId, orderId, adminUserId);
          counts[result] += 1;
        }
      },
    );

    try {
      await Promise.all(workers);
    } catch (err: any) {
      this.logger.error(
        `Manifest job ${jobId} worker pool error: ${err?.message || err}`,
      );
    }

    this.emit(adminUserId, 'orders:manifest:completed', {
      job_id: jobId,
      counts,
    });
  }

  private async manifestOne(
    jobId: string,
    orderId: string,
    adminUserId: string,
  ): Promise<'success' | 'failed' | 'skipped'> {
    const maxAttempts = MAX_ATTEMPTS;

    const emitProgress = (
      status: ManifestProgressStatus,
      attempt: number,
      extra?: { message?: string; waybill_number?: string },
    ) => {
      this.emit(adminUserId, 'orders:manifest:progress', {
        job_id: jobId,
        order_id: orderId,
        status,
        attempt,
        max_attempts: maxAttempts,
        ...extra,
      });
    };

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        shipment_details: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        payment: true,
        pricing: true,
        order_items: true,
      },
    });

    if (!order) {
      emitProgress('skipped', 0, { message: 'Order not found' });
      return 'skipped';
    }

    if (!ELIGIBLE_STATUSES.includes(order.status)) {
      emitProgress('skipped', 0, {
        message: `Order status ${order.status} is not eligible`,
      });
      return 'skipped';
    }

    if (!order.address) {
      emitProgress('skipped', 0, { message: 'Order has no shipping address' });
      return 'skipped';
    }

    if (order.shipment_details?.waybill_number) {
      emitProgress('skipped', 0, {
        message: 'Already has waybill',
        waybill_number: order.shipment_details.waybill_number,
      });
      return 'skipped';
    }

    let lastMessage = 'Unknown error';
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const existing = await this.prisma.orderShipmentDetails.findUnique({
        where: { order_id: orderId },
      });
      if (existing?.waybill_number) {
        emitProgress('skipped', attempt, {
          message: 'Already has waybill',
          waybill_number: existing.waybill_number,
        });
        return 'skipped';
      }

      emitProgress('attempting', attempt);

      try {
        const result = await this.delhiveryService.createShipment(order as any);
        await this.orderService.upsertOrderShipmentDetails({
          order_id: orderId,
          waybill_number: result.waybill_number,
          tracking_url: result.tracking_url,
          delivery_partner: 'Delhivery',
          estimated_delivery: result.estimated_delivery,
        });

        this.activityLogger.logSuccess(
          'Order: Delhivery manifest success',
          `Order ${orderId} waybill ${result.waybill_number}`,
          {
            source: 'order_manifest',
            order_id: orderId,
            waybill_number: result.waybill_number,
            job_id: jobId,
            user_id: adminUserId,
          },
          adminUserId,
        );

        emitProgress('success', attempt, {
          waybill_number: result.waybill_number,
        });
        return 'success';
      } catch (err: any) {
        lastMessage = err?.message || String(err);
        const retryable = isRetryableManifestError(err);
        const willRetry = retryable && attempt < maxAttempts;

        this.activityLogger.logError(
          'Order: Delhivery manifest failed',
          lastMessage,
          {
            source: 'order_manifest',
            order_id: orderId,
            job_id: jobId,
            attempt,
            retryable,
            will_retry: willRetry,
            user_id: adminUserId,
          },
          adminUserId,
        );

        if (willRetry) {
          emitProgress('attempting', attempt, {
            message: `Retrying: ${lastMessage}`,
          });
          await sleep(500 * Math.pow(2, attempt - 1));
          continue;
        }

        emitProgress('failed', attempt, { message: lastMessage });
        return 'failed';
      }
    }

    emitProgress('failed', maxAttempts, { message: lastMessage });
    return 'failed';
  }
}
