/**
 * Delhivery Track API (`GET /api/v1/packages/json/?waybill=&ref_ids=`) response shapes.
 * Aligned with live payloads from track.delhivery.com.
 */

export interface DelhiveryTrackScanDetail {
  Instructions?: string;
  Scan?: string;
  ScanDateTime?: string;
  ScanType?: string;
  ScannedLocation?: string;
  StatusCode?: string;
  StatusDateTime?: string;
  /** Normalized / legacy aliases used internally after flatten */
  ScannedAt?: string;
  Instruction?: string;
  status?: string;
}

export interface DelhiveryTrackScan {
  ScanDetail?: DelhiveryTrackScanDetail;
  /** Rare flattened variants */
  Scan?: string;
  DetailedStatus?: {
    Instructions?: string;
    Status?: string;
  };
}

export interface DelhiveryTrackConsignee {
  Address1?: string | string[];
  Address2?: string | string[];
  Address3?: string;
  City?: string;
  Country?: string;
  Name?: string;
  PinCode?: number | string;
  State?: string;
  Telephone1?: string | string[];
  Telephone2?: string;
}

export interface DelhiveryTrackStatus {
  Instructions?: string;
  RecievedBy?: string;
  Status?: string;
  StatusCode?: string;
  StatusDateTime?: string;
  StatusLocation?: string;
  StatusType?: string;
}

/**
 * `ShipmentData[].Shipment` — full package object from Track API.
 */
export interface DelhiveryTrackShipment {
  AWB?: string;
  CODAmount?: number;
  ChargedWeight?: number | null;
  Consignee?: DelhiveryTrackConsignee;
  DeliveryDate?: string | null;
  DestRecieveDate?: string | null;
  Destination?: string;
  DispatchCount?: number;
  Ewaybill?: unknown[];
  /** Some payloads use EWBN instead of Ewaybill */
  EWBN?: unknown[];
  ExpectedDeliveryDate?: string | null;
  Extras?: string;
  FirstAttemptDate?: string | null;
  InvoiceAmount?: number;
  OrderType?: string;
  Origin?: string;
  OriginRecieveDate?: string | null;
  OutDestinationDate?: string | null;
  PickUpDate?: string | null;
  PickedupDate?: string | null;
  PickupLocation?: string;
  PromisedDeliveryDate?: string | null;
  Quantity?: string | number;
  RTOStartedDate?: string | null;
  ReferenceNo?: string;
  ReturnPromisedDeliveryDate?: string | null;
  ReturnedDate?: string | null;
  ReverseInTransit?: boolean;
  Scans?: DelhiveryTrackScan[];
  SenderName?: string;
  Status?: DelhiveryTrackStatus;
}

/** One element of `ShipmentData[]` from the Track API. */
export interface DelhiveryTrackShipmentDataItem {
  Shipment?: DelhiveryTrackShipment;
  Error?: string;
}

export interface DelhiveryTrackResponse {
  ShipmentData?: DelhiveryTrackShipmentDataItem[];
  Error?: string;
  rmks?: string;
  Remark?: string;
}

/** Normalized package for admin / public tracking UI. */
export interface NormalizedTrackingInfo {
  AWB?: string;
  ReferenceNo?: string;
  Origin?: string;
  Destination?: string;
  OrderType?: string;
  PickupLocation?: string;
  SenderName?: string;
  Scans: DelhiveryTrackScan[];
  Status?: DelhiveryTrackStatus;
  Consignee?: DelhiveryTrackConsignee;
  /** Original Delhivery Shipment object (full fidelity). */
  Shipment?: DelhiveryTrackShipment;
}
