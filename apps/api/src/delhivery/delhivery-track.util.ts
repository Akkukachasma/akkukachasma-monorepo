import type {
  DelhiveryTrackScan,
  DelhiveryTrackShipmentDataItem,
  DelhiveryTrackStatus,
  NormalizedTrackingInfo,
} from './delhivery-track.types';

/**
 * Flatten Delhivery Track API package so UI always reads top-level Scans.
 * Maps ScanDateTime → ScannedAt for frontend compatibility.
 */
export function normalizeTrackingPackage(
  pkg: DelhiveryTrackShipmentDataItem | null | undefined,
): NormalizedTrackingInfo | null {
  if (!pkg?.Shipment && !pkg) return null;
  if (!pkg.Shipment) {
    return null;
  }

  const shipment = pkg.Shipment;
  const scans: DelhiveryTrackScan[] = shipment.Scans ?? [];

  const normalizedScans: DelhiveryTrackScan[] = scans.map((scan) => {
    const detail = scan.ScanDetail ?? {};
    const scannedAt =
      detail.ScannedAt ?? detail.ScanDateTime ?? detail.StatusDateTime;
    const scanText = detail.Scan ?? scan.Scan ?? detail.Instructions;
    return {
      ...scan,
      Scan: scan.Scan ?? scanText,
      ScanDetail: {
        ...detail,
        ScannedAt: scannedAt,
        Scan: scanText,
        Instructions: detail.Instructions,
        Instruction: detail.Instruction ?? detail.Instructions,
      },
      DetailedStatus: scan.DetailedStatus ?? {
        Status: scanText,
        Instructions: detail.Instructions,
      },
    };
  });

  const status: DelhiveryTrackStatus | undefined = shipment.Status;

  return {
    AWB: shipment.AWB,
    ReferenceNo: shipment.ReferenceNo,
    Origin: shipment.Origin,
    Destination: shipment.Destination,
    OrderType: shipment.OrderType,
    PickupLocation: shipment.PickupLocation,
    SenderName: shipment.SenderName,
    Scans: normalizedScans,
    Status: status,
    Consignee: shipment.Consignee,
    Shipment: shipment,
  };
}
