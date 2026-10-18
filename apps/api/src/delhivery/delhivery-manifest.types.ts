/**
 * Delhivery CMU create / manifest API
 * (`POST …/api/cmu/create.json`, form `format=json&data=…`)
 */

/** One package entry in a successful (or partial) manifest response. */
export interface DelhiveryManifestPackage {
  waybill?: string;
  /** Client reference we sent as `order` (e.g. orderId__invoiceSlug). */
  refnum?: string;
  client?: string;
  /** e.g. "Pre-paid" | "COD" */
  payment?: string;
  cod_amount?: number;
  /** e.g. "Success" | "Failure" */
  status?: string;
  sort_code?: string;
  serviceable?: boolean;
  remarks?: string[];
}

/**
 * Top-level JSON body from Delhivery manifest (CMU create).
 * Captured from production: success=true with packages[].waybill + refnum.
 */
export interface DelhiveryManifestResponse {
  success?: boolean;
  package_count?: number;
  prepaid_count?: number;
  cash_pickups_count?: number;
  cash_pickups?: number;
  pickups_count?: number;
  replacement_count?: number;
  cod_amount?: number;
  cod_count?: number;
  /** Upload batch id, e.g. "UPL8184267424721618441" */
  upload_wbn?: string;
  packages?: DelhiveryManifestPackage[];
  /** Error remarks (field name varies across Delhivery environments). */
  rmk?: string;
  rmks?: string;
  Remark?: string;
  Error?: string;
}
