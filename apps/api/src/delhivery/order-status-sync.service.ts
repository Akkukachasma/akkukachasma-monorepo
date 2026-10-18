import { Injectable } from '@nestjs/common';
import type {
  DelhiveryTrackScan,
  DelhiveryTrackStatus,
} from './delhivery-track.types';
import { DelhiveryService } from './delhivery.service';
import { DelhiveryWebhookService } from './delhivery-webhook.service';
import { normalizeTrackingPackage } from './delhivery-track.util';
import type { NormalizedTrackingInfo } from './delhivery-track.types';

export interface OrderWithShipment {
  id: string;
  status: string;
  shipment_details?: {
    waybill_number: string | null;
  } | null;
}

export interface SyncResult {
  synced: boolean;
  trackingInfo: NormalizedTrackingInfo | null;
}

@Injectable()
export class OrderStatusSyncService {
  constructor(
    private readonly delhiveryService: DelhiveryService,
    private readonly delhiveryWebhookService: DelhiveryWebhookService,
  ) {}

  /**
   * Poll Delhivery Track API (`waybill` + `ref_ids`) and optionally sync order status.
   * Always returns normalized tracking info for UI when the API responds.
   */
  async syncOrderFromDelhiveryIfNeeded(
    orderId: string,
    order: OrderWithShipment,
  ): Promise<SyncResult> {
    const waybill = order.shipment_details?.waybill_number ?? null;
    if (!waybill) {
      return { synced: false, trackingInfo: null };
    }

    const refIds = await this.delhiveryService.resolveTrackRefIds(orderId);
    const trackingResponse = await this.delhiveryService.trackPackage(
      waybill,
      refIds,
    );
    const rawPkg = trackingResponse?.ShipmentData?.[0] ?? null;
    const trackingInfo = normalizeTrackingPackage(rawPkg);

    const isFinal =
      order.status === 'delivered' || order.status === 'cancelled';
    if (isFinal) {
      return { synced: false, trackingInfo };
    }

    const scans: DelhiveryTrackScan[] = trackingInfo?.Scans ?? [];
    const shipment = rawPkg?.Shipment;

    let synced = false;
    if (scans.length > 0) {
      synced = await this.delhiveryWebhookService
        .syncOrderStatusFromScans(orderId, waybill, scans)
        .catch(() => false);
    }

    const pkgStatus: DelhiveryTrackStatus | undefined =
      shipment?.Status ?? trackingInfo?.Status;
    const statusInstructions = pkgStatus?.Instructions ?? '';
    const topStatus = (pkgStatus?.Status ?? '').toLowerCase();

    if (!synced) {
      const instructionsLower = statusInstructions.toLowerCase();
      const isCancelledByStatus =
        topStatus.includes('cancel') ||
        topStatus.includes('cancelled') ||
        topStatus.includes('returned') ||
        topStatus.includes('rto');
      const isCancelledByNotPicked =
        (topStatus.includes('not picked') ||
          topStatus.includes('notpicked')) &&
        (instructionsLower.includes('not received') ||
          instructionsLower.includes('cancelled') ||
          instructionsLower.includes('cancel'));
      if (isCancelledByStatus || isCancelledByNotPicked) {
        synced = await this.delhiveryWebhookService
          .syncOrderStatusFromPackageStatus(orderId, waybill, {
            Shipment: shipment,
            Status: pkgStatus,
          })
          .catch(() => false);
      }
    }

    return {
      synced,
      trackingInfo,
    };
  }
}
