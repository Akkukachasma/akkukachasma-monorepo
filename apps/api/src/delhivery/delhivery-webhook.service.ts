import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import type { DelhiveryTrackScan } from './delhivery-track.types';
import { InvoiceService } from '../invoice/invoice.service';

/**
 * Applies Delhivery Track API poll results to order status.
 * (Webhook push path removed — tracking is poll-only.)
 */
@Injectable()
export class DelhiveryWebhookService {
  private readonly logger = new Logger(DelhiveryWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /**
   * Derive picked_at and delivered_at from Delhivery scans (from Track API).
   * Used by poll job and matches frontend OrderStatusTracker logic.
   */
  static mapScansToStatus(
    scans: DelhiveryTrackScan[],
  ): {
    picked_at?: Date;
    delivered_at?: Date;
    cancelled_at?: Date;
    derivedStatus: OrderStatus;
  } {
    if (!scans?.length) {
      return { derivedStatus: OrderStatus.confirmed };
    }
    let picked_at: Date | undefined;
    let delivered_at: Date | undefined;
    let cancelled_at: Date | undefined;
    const getScannedAt = (s: DelhiveryTrackScan) =>
      s.ScanDetail?.ScannedAt ??
      s.ScanDetail?.ScanDateTime ??
      s.ScanDetail?.StatusDateTime;
    const sorted = [...scans].sort((a, b) => {
      const atA = getScannedAt(a) ?? '';
      const atB = getScannedAt(b) ?? '';
      return String(atA).localeCompare(String(atB));
    });
    for (const scan of sorted) {
      const text = (
        (scan.Scan ?? scan.ScanDetail?.Scan ?? '') +
        ' ' +
        (scan.ScanDetail?.Instruction ?? scan.ScanDetail?.Instructions ?? '') +
        ' ' +
        (scan.DetailedStatus?.Status ?? '') +
        ' ' +
        (scan.DetailedStatus?.Instructions ?? '')
      ).toLowerCase();
      const scannedAt = getScannedAt(scan);
      if (scannedAt) {
        const at = new Date(scannedAt);
        if (isNaN(at.getTime())) continue;
        if (
          !cancelled_at &&
          (text.includes('cancel') ||
            text.includes('cancelled') ||
            text.includes('returned') ||
            text.includes('rto') ||
            text.trim() === 'cn' ||
            /\bcn\b/.test(text) ||
            (text.includes('not picked') &&
              (text.includes('not received') ||
                text.includes('cancelled') ||
                text.includes('cancel'))))
        ) {
          cancelled_at = at;
        } else if (
          !delivered_at &&
          !cancelled_at &&
          (text.includes('delivered') ||
            text.trim() === 'dl' ||
            /\bdl\b/.test(text))
        ) {
          delivered_at = at;
        } else if (
          !picked_at &&
          !cancelled_at &&
          (text.includes('pickup') ||
            text.includes('picked') ||
            text.includes('collected') ||
            text.includes('dispatched') ||
            text.includes('transit'))
        ) {
          picked_at = at;
        }
      }
    }
    let derivedStatus: OrderStatus = OrderStatus.confirmed;
    if (cancelled_at) derivedStatus = OrderStatus.cancelled;
    else if (delivered_at) derivedStatus = OrderStatus.delivered;
    else if (picked_at) derivedStatus = OrderStatus.picked;
    return { picked_at, delivered_at, cancelled_at, derivedStatus };
  }

  /**
   * Sync order status from Track API scans. Idempotent - only moves forward.
   * Used by poll job.
   */
  async syncOrderStatusFromScans(
    orderId: string,
    waybillNumber: string,
    scans: DelhiveryTrackScan[],
  ): Promise<boolean> {
    const shipmentDetails =
      await this.prisma.orderShipmentDetails.findFirst({
        where: { order_id: orderId, waybill_number: waybillNumber },
        include: { order: true },
      });
    if (!shipmentDetails) return false;

    const currentStatus = shipmentDetails.order.status;
    const { picked_at, delivered_at, cancelled_at, derivedStatus } =
      DelhiveryWebhookService.mapScansToStatus(scans);

    if (derivedStatus === OrderStatus.confirmed) return false;
    if (currentStatus === OrderStatus.delivered) return false;

    const updates: {
      status: OrderStatus;
      picked_at?: Date;
      delivered_at?: Date;
      cancelled_at?: Date;
    } = { status: currentStatus };

    if (derivedStatus === OrderStatus.cancelled && cancelled_at) {
      updates.status = OrderStatus.cancelled;
      updates.cancelled_at = cancelled_at;
    } else if (derivedStatus === OrderStatus.delivered && delivered_at) {
      updates.status = OrderStatus.delivered;
      updates.delivered_at = delivered_at;
      if (currentStatus !== OrderStatus.picked) {
        updates.picked_at = picked_at ?? delivered_at;
      }
    } else if (derivedStatus === OrderStatus.picked && picked_at) {
      updates.status = OrderStatus.picked;
      updates.picked_at = picked_at;
    }

    if (
      updates.status === currentStatus &&
      !updates.picked_at &&
      !updates.delivered_at
    ) {
      return false;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: updates.status,
          ...(updates.picked_at && { picked_at: updates.picked_at }),
          ...(updates.delivered_at && { delivered_at: updates.delivered_at }),
          ...(updates.cancelled_at && { cancelled_at: updates.cancelled_at }),
        },
      });
      if (updates.status === OrderStatus.delivered && updates.delivered_at) {
        await tx.orderShipmentDetails.update({
          where: { order_id: orderId },
          data: { actual_delivery: updates.delivered_at },
        });
      }
      await this.invoiceService.syncFromOrderLifecycle(orderId, tx);
    });

    this.logger.log(
      `Delhivery sync: order ${orderId} updated to ${updates.status}`,
    );
    return true;
  }

  /**
   * Sync order status when Track API returns package-level Status (e.g. "Order Cancelled")
   * but no Scans. Used when Scans is empty but Status indicates cancelled.
   */
  async syncOrderStatusFromPackageStatus(
    orderId: string,
    waybillNumber: string,
    pkg: {
      Shipment?: {
        Status?: {
          Status?: string;
          StatusDateTime?: string;
          Instructions?: string;
        };
      };
      ShipmentData?: {
        Status?: { Status?: string; StatusDateTime?: string };
      };
      Status?: {
        Status?: string;
        StatusDateTime?: string;
        Instructions?: string;
      };
    },
  ): Promise<boolean> {
    const shipmentDetails =
      await this.prisma.orderShipmentDetails.findFirst({
        where: { order_id: orderId, waybill_number: waybillNumber },
        include: { order: true },
      });
    if (!shipmentDetails) return false;

    const currentStatus = shipmentDetails.order.status;
    if (currentStatus === OrderStatus.delivered) return false;

    const shipStatus = pkg?.Shipment?.Status;
    const inner = pkg?.ShipmentData as
      | { Status?: { Status?: string; StatusDateTime?: string } }
      | undefined;
    const root = pkg?.Status;
    const statusText = (
      shipStatus?.Status ??
      inner?.Status?.Status ??
      root?.Status ??
      ''
    ).toLowerCase();
    const instructions = (
      shipStatus?.Instructions ??
      (root as { Instructions?: string })?.Instructions ??
      ''
    ).toLowerCase();
    const statusDateTime =
      shipStatus?.StatusDateTime ??
      inner?.Status?.StatusDateTime ??
      root?.StatusDateTime;

    const isCancelled =
      statusText.includes('cancel') ||
      statusText.includes('cancelled') ||
      statusText.includes('returned') ||
      statusText.includes('rto') ||
      ((statusText.includes('not picked') ||
        statusText.includes('notpicked')) &&
        (instructions.includes('not received') ||
          instructions.includes('cancelled') ||
          instructions.includes('cancel')));

    if (!isCancelled) return false;

    const parsedAt = statusDateTime ? new Date(statusDateTime) : new Date();
    if (isNaN(parsedAt.getTime())) {
      return false;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.cancelled,
          cancelled_at: parsedAt,
        },
      });
      await this.invoiceService.syncFromOrderLifecycle(orderId, tx);
    });

    this.logger.log(
      `Delhivery sync (package status): order ${orderId} updated to cancelled`,
    );
    return true;
  }
}
