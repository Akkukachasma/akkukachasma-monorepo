import { normalizeTrackingPackage } from './delhivery-track.util';

describe('normalizeTrackingPackage', () => {
  it('flattens nested Shipment.Scans to top-level Scans', () => {
    const normalized = normalizeTrackingPackage({
      Shipment: {
        AWB: 'WB1',
        ReferenceNo: 'order123__AKC-26-27-29',
        Scans: [
          {
            ScanDetail: {
              Scan: 'In Transit',
              ScanDateTime: '2026-07-26T10:00:00',
              ScannedLocation: 'Delhi_Gateway',
              Instructions: 'Shipment in transit',
              ScanType: 'UD',
              StatusCode: 'X-IBD',
            },
          },
        ],
        Status: {
          Status: 'In Transit',
          StatusType: 'UD',
          StatusDateTime: '2026-07-26T10:00:00',
          Instructions: 'Shipment in transit',
        },
      },
    });

    expect(normalized?.AWB).toBe('WB1');
    expect(normalized?.ReferenceNo).toBe('order123__AKC-26-27-29');
    expect(normalized?.Scans).toHaveLength(1);
    expect(normalized?.Scans[0].ScanDetail?.ScannedAt).toBe(
      '2026-07-26T10:00:00',
    );
    expect(normalized?.Scans[0].ScanDetail?.Instructions).toBe(
      'Shipment in transit',
    );
    expect(normalized?.Status?.Status).toBe('In Transit');
    expect(normalized?.Shipment?.Status?.StatusType).toBe('UD');
  });

  it('returns null for empty input', () => {
    expect(normalizeTrackingPackage(null)).toBeNull();
    expect(normalizeTrackingPackage({} as any)).toBeNull();
  });
});
