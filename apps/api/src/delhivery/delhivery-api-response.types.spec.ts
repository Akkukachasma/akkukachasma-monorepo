import type { DelhiveryManifestResponse } from './delhivery-manifest.types';
import type { DelhiveryTrackResponse } from './delhivery-track.types';
import { normalizeTrackingPackage } from './delhivery-track.util';

/** Sample captured from track.delhivery.com CMU create (2026-07-26). */
const MANIFEST_SAMPLE: DelhiveryManifestResponse = {
  cash_pickups_count: 0,
  package_count: 1,
  prepaid_count: 1,
  pickups_count: 0,
  replacement_count: 0,
  cash_pickups: 0,
  cod_amount: 0,
  cod_count: 0,
  upload_wbn: 'UPL8184267424721618441',
  packages: [
    {
      waybill: '1843910017345',
      refnum: '6a650b09c336e369664dfeff__AKC-26-27-30',
      client: 'AKKUKACHASMACOM SURFACE',
      payment: 'Pre-paid',
      cod_amount: 0,
      status: 'Success',
      sort_code: 'AZA/HUS',
      serviceable: true,
      remarks: [''],
    },
  ],
  success: true,
};

/** Sample captured from Track API for the same waybill. */
const TRACK_SAMPLE: DelhiveryTrackResponse = {
  ShipmentData: [
    {
      Shipment: {
        AWB: '1843910017345',
        CODAmount: 0,
        ChargedWeight: null,
        Consignee: {
          Address1: [],
          Address2: [],
          Address3: '',
          City: 'Azamgarh',
          Country: 'India',
          Name: 'Praveen Goswami',
          PinCode: 276128,
          State: 'Uttar Pradesh',
          Telephone1: '',
          Telephone2: '',
        },
        DeliveryDate: null,
        DestRecieveDate: null,
        Destination: 'Azamgarh',
        DispatchCount: 0,
        Ewaybill: [],
        ExpectedDeliveryDate: null,
        Extras: '',
        FirstAttemptDate: null,
        InvoiceAmount: 0,
        OrderType: 'Pre-paid',
        Origin: 'Allahabad_TagoreTown_D (Uttar Pradesh)',
        OriginRecieveDate: null,
        OutDestinationDate: null,
        PickUpDate: '2026-07-26T13:50:46.647',
        PickedupDate: null,
        PickupLocation: 'AKKUKACHASMACOM SURFACE',
        PromisedDeliveryDate: null,
        Quantity: '',
        RTOStartedDate: null,
        ReferenceNo: '6a650b09c336e369664dfeff__AKC-26-27-30',
        ReturnPromisedDeliveryDate: null,
        ReturnedDate: null,
        ReverseInTransit: false,
        Scans: [
          {
            ScanDetail: {
              Instructions: 'Manifest uploaded',
              Scan: 'Manifested',
              ScanDateTime: '2026-07-26T13:50:46.684',
              ScanType: 'UD',
              ScannedLocation: 'Allahabad_TagoreTown_D (Uttar Pradesh)',
              StatusCode: 'X-UCI',
              StatusDateTime: '2026-07-26T13:50:46.684',
            },
          },
          {
            ScanDetail: {
              Instructions: 'Bad/Incomplete Address',
              Scan: 'Manifested',
              ScanDateTime: '2026-07-26T13:50:54.65',
              ScanType: 'UD',
              ScannedLocation: 'Allahabad_TagoreTown_D (Uttar Pradesh)',
              StatusCode: 'ST-102',
              StatusDateTime: '2026-07-26T13:50:54.65',
            },
          },
        ],
        SenderName: 'AKKUKACHASMACOM SURFACE',
        Status: {
          Instructions: 'Bad/Incomplete Address',
          RecievedBy: '',
          Status: 'Manifested',
          StatusCode: 'ST-102',
          StatusDateTime: '2026-07-26T13:50:54.65',
          StatusLocation: 'Allahabad_TagoreTown_D (Uttar Pradesh)',
          StatusType: 'UD',
        },
      },
    },
  ],
};

describe('Delhivery live API response types', () => {
  it('types the CMU manifest success body', () => {
    expect(MANIFEST_SAMPLE.success).toBe(true);
    expect(MANIFEST_SAMPLE.packages?.[0]?.waybill).toBe('1843910017345');
    expect(MANIFEST_SAMPLE.packages?.[0]?.refnum).toContain('__AKC-');
    expect(MANIFEST_SAMPLE.upload_wbn).toMatch(/^UPL/);
  });

  it('types and normalizes the Track API body', () => {
    const pkg = TRACK_SAMPLE.ShipmentData?.[0];
    const normalized = normalizeTrackingPackage(pkg);
    expect(normalized?.AWB).toBe('1843910017345');
    expect(normalized?.ReferenceNo).toBe(
      '6a650b09c336e369664dfeff__AKC-26-27-30',
    );
    expect(normalized?.Status?.Status).toBe('Manifested');
    expect(normalized?.Status?.StatusCode).toBe('ST-102');
    expect(normalized?.Scans).toHaveLength(2);
    expect(normalized?.Scans[1].ScanDetail?.Instructions).toBe(
      'Bad/Incomplete Address',
    );
    expect(normalized?.PickupLocation).toBe('AKKUKACHASMACOM SURFACE');
    expect(normalized?.Shipment?.SenderName).toBe('AKKUKACHASMACOM SURFACE');
  });
});
