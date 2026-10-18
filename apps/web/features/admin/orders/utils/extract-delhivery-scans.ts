export type DelhiveryScanLike = {
  Scan?: string;
  ScanDetail?: {
    ScannedAt?: string;
    ScanDateTime?: string;
    StatusDateTime?: string;
    Scan?: string;
    ScannedLocation?: string;
    Instruction?: string;
    Instructions?: string;
  };
  DetailedStatus?: { Status?: string };
};

/**
 * Read scans from normalized or nested Delhivery Track package shapes.
 */
export function extractDelhiveryScans(
  trackingInfo: {
    Scans?: DelhiveryScanLike[];
    Shipment?: { Scans?: DelhiveryScanLike[] };
  } | null | undefined,
): DelhiveryScanLike[] {
  if (!trackingInfo) return [];
  const scans =
    trackingInfo.Scans ?? trackingInfo.Shipment?.Scans ?? [];
  return scans.map((scan) => {
    const detail = scan.ScanDetail ?? {};
    const scannedAt =
      detail.ScannedAt ?? detail.ScanDateTime ?? detail.StatusDateTime;
    const instruction =
      detail.Instruction ?? detail.Instructions;
    return {
      ...scan,
      Scan: scan.Scan ?? detail.Scan ?? instruction,
      ScanDetail: {
        ...detail,
        ScannedAt: scannedAt,
        Instruction: instruction,
      },
    };
  });
}
