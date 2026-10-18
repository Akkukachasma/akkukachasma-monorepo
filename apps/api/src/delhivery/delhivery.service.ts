import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InvoiceStatus } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { isActiveOrderLine } from '../order/order-item-active';
import { ERR_TYPES } from '../../lib/constants';
import {
  buildDelhiveryOrderRef,
  formatSellerInvDate,
  sanitizeInvoiceForDelhivery,
} from './delhivery-order-ref.util';
import type {
  DelhiveryTrackResponse,
  DelhiveryTrackShipment,
  NormalizedTrackingInfo,
} from './delhivery-track.types';
import type { DelhiveryManifestResponse } from './delhivery-manifest.types';

export type {
  DelhiveryManifestPackage,
  DelhiveryManifestResponse,
} from './delhivery-manifest.types';

export type {
  DelhiveryTrackConsignee,
  DelhiveryTrackResponse,
  DelhiveryTrackScan,
  DelhiveryTrackScanDetail,
  DelhiveryTrackShipment,
  DelhiveryTrackShipmentDataItem,
  DelhiveryTrackStatus,
  NormalizedTrackingInfo,
} from './delhivery-track.types';

/** @deprecated Use NormalizedTrackingInfo / DelhiveryTrackShipment */
export type DelhiveryTrackPackage = NormalizedTrackingInfo & {
  OrderID?: string;
  ShipmentData?: {
    Awb?: string;
    OrderID?: string;
    ReferenceNo?: string;
    Status?: { Status?: string; StatusDateTime?: string };
    TransitDetails?: Array<{
      Scan?: string;
      ScanDetail?: { ScannedAt?: string };
    }>;
  };
};

/** @deprecated Use DelhiveryTrackShipmentDataItem */
export type DelhiveryTrackApiShipment = {
  Shipment?: DelhiveryTrackShipment;
  Error?: string;
};

/** Public tracking page URL (for "Track on Delhivery" link). */
const DELHIVERY_TRACK_BASE = 'https://www.delhivery.com/track-v2/package';
/** Default Track API (works with Token auth). */
const DELHIVERY_TRACK_API_DEFAULT = 'https://track.delhivery.com/api/v1/packages/json/';
/** Prod fallback when MANIFEST_ORDER_API is unset. */
const DELHIVERY_CMU_API_DEFAULT = 'https://track.delhivery.com/api/cmu/create.json';

const DEFAULT_WEIGHT_GM = 350.0;
const DEFAULT_LENGTH_CM = 17.0;
const DEFAULT_WIDTH_CM = 12.0;
const DEFAULT_HEIGHT_CM = 8.0;
/** Delhivery rejects these in free-text payload fields. */
const DELHIVERY_FORBIDDEN_CHARS = /[&#%;\\]/g;
const MANIFEST_RESPONSE_LOG_MAX = 16_000;

/** Delhivery `state_code` → full state name used in address forms. */
const DELHIVERY_STATE_CODE_TO_NAME: Record<string, string> = {
  AN: 'Andaman and Nicobar Islands',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CH: 'Chandigarh',
  CT: 'Chhattisgarh',
  CG: 'Chhattisgarh',
  DN: 'Dadra and Nagar Haveli and Daman and Diu',
  DD: 'Dadra and Nagar Haveli and Daman and Diu',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JK: 'Jammu and Kashmir',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OR: 'Odisha',
  OD: 'Odisha',
  PY: 'Puducherry',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TS: 'Telangana',
  TG: 'Telangana',
  TR: 'Tripura',
  UP: 'Uttar Pradesh',
  UT: 'Uttarakhand',
  UK: 'Uttarakhand',
  WB: 'West Bengal',
};

export interface OrderShipmentInfo {
  waybill_number: string;
  tracking_url: string;
  delivery_partner: string;
  estimated_delivery?: Date;
  actual_delivery?: Date;
}

export interface PublicTrackOrderResponse {
  order_id: string;
  status: string;
  created_at?: string;
  confirmed_at?: string;
  picked_at?: string;
  delivered_at?: string;
  shipment?: OrderShipmentInfo;
  tracking_info?: NormalizedTrackingInfo;
  address?: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
  };
  customer_name?: string;
}

export interface CreateShipmentResult {
  waybill_number: string;
  tracking_url: string;
  estimated_delivery?: Date;
  /** Delhivery client reference echoed as packages[].refnum */
  refnum?: string;
  upload_wbn?: string;
  sort_code?: string;
  payment?: string;
}

export type PincodeServiceabilityResult =
  | {
      status: 'ok';
      prepaid: boolean;
      cod: boolean;
      city?: string;
      district?: string;
      stateCode?: string;
      state?: string;
    }
  | { status: 'unavailable'; reason: string };

export interface AssertPincodeDeliverableOptions {
  requireCod?: boolean;
  allowUnverified?: boolean;
  acknowledgeUnverified?: boolean;
}

interface OrderForShipment {
  id: string;
  user: { name: string; email: string; phone_number: string | null };
  address: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
  } | null;
  payment: { mode: string } | null;
  pricing: { total: number } | null;
  order_items: Array<{
    product_color: {
      model_number?: string;
      product?: { model_name?: string };
      thumbnail?: string;
    };
    quantity: number;
    price: number | null;
  }>;
}

@Injectable()
export class DelhiveryService {
  private readonly logger = new Logger(DelhiveryService.name);
  private readonly apiKey: string;
  private readonly trackApiUrl: string;
  private readonly pincodeServiceabilityUrl: string;
  private readonly manifestOrderUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly activityLogger: ActivityLoggerService,
  ) {
    this.apiKey = this.configService.get<string>('DELIVERY_API_KEY') || '';
    this.trackApiUrl =
      this.configService.get<string>('TRACKING_URL') ||
      this.configService.get<string>('DELHIVERY_TRACK_API_URL') ||
      DELHIVERY_TRACK_API_DEFAULT;
    this.pincodeServiceabilityUrl =
      this.configService.get<string>('PINCODE_SERVICEABILITY_URL') ||
      'https://track.delhivery.com/c/api/pin-codes/json/';
    this.manifestOrderUrl =
      this.configService.get<string>('MANIFEST_ORDER_API') ||
      DELHIVERY_CMU_API_DEFAULT;
  }

  private logActivity(
    source: string,
    waybill: string,
    refIds: string | undefined,
    payload: Record<string, unknown>,
    opts?: { type?: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING' | 'ALERT'; title?: string },
  ): void {
    const type = opts?.type ?? 'INFO';
    const title = opts?.title ?? 'Delhivery Track API';
    const detail = JSON.parse(
      JSON.stringify({
        source,
        waybill,
        ref_ids: refIds ?? undefined,
        ...payload,
      }),
    ) as Record<string, unknown>;
    const description = payload.error ? String(payload.error) : undefined;
    const logDetail = { ...detail, source };
    switch (type) {
      case 'ERROR':
        this.activityLogger.logError(title, description, logDetail);
        break;
      case 'WARNING':
        this.activityLogger.logWarning(title, description, logDetail);
        break;
      case 'SUCCESS':
        this.activityLogger.logSuccess(title, description, logDetail);
        break;
      case 'ALERT':
        this.activityLogger.logAlert(title, description, logDetail);
        break;
      default:
        this.activityLogger.logInfo(title, description, logDetail);
        break;
    }
  }

  private getAuthHeader(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('DELIVERY_API_KEY is not configured');
    }
    return {
      Authorization: `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async trackPackage(
    waybillNumber: string,
    refIds?: string,
  ): Promise<DelhiveryTrackResponse | null> {
    if (!this.apiKey) {
      this.logger.warn('DELIVERY_API_KEY not configured, skipping Delhivery API call');
      return null;
    }

    const params = new URLSearchParams({ waybill: waybillNumber });
    if (refIds) params.set('ref_ids', refIds);
    const url = `${this.trackApiUrl}?${params.toString()}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<DelhiveryTrackResponse | string>(url, {
          headers: this.getAuthHeader(),
          timeout: 10000,
        }),
      );

      const data = response.data;
      const isHtml =
        typeof data === 'string' &&
        (data.trimStart().toLowerCase().startsWith('<!') ||
          data.includes('<html'));
      if (isHtml) {
        this.logActivity(
          'delhivery_track_api',
          waybillNumber,
          refIds,
          {
            error: 'Response was HTML, not JSON',
            url,
            response_preview: String(data).slice(0, 500),
          },
          { type: 'WARNING', title: 'Delhivery Track API - HTML Response' },
        );
        this.logger.warn(
          `Delhivery track returned HTML for waybill ${waybillNumber}; check API URL`,
        );
        return null;
      }

      this.logActivity(
        'delhivery_track_api',
        waybillNumber,
        refIds,
        { response: data },
        { type: 'SUCCESS', title: 'Delhivery Track API' },
      );
      return data as DelhiveryTrackResponse;
    } catch (error: any) {
      const errData = error?.response?.data;
      const status = error?.response?.status;
      this.logActivity(
        'delhivery_track_api',
        waybillNumber,
        refIds,
        {
          error: 'Track API failed',
          url,
          status,
          message: error?.message,
          response: errData ?? String(error?.message || 'Unknown error'),
        },
        { type: 'ERROR', title: 'Delhivery Track API - Failed' },
      );
      this.logger.warn(
        `Delhivery track failed for waybill ${waybillNumber}: ${errData?.rmks || errData?.message || error?.message}`,
      );
      return null;
    }
  }

  /**
   * Client reference for Track API `ref_ids` — matches createShipment `order` field
   * (`orderId` or `orderId__invoiceSlug`).
   */
  async resolveTrackRefIds(orderId: string): Promise<string> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { order_id: orderId },
      select: { invoice_number: true, status: true },
    });
    if (!invoice || invoice.status === InvoiceStatus.void) {
      return orderId;
    }
    return buildDelhiveryOrderRef(orderId, invoice.invoice_number);
  }

  buildTrackingUrl(waybillNumber: string): string {
    return `${DELHIVERY_TRACK_BASE}/${waybillNumber}`;
  }

  /** Strip characters Delhivery rejects in free-text fields (& # % ; \). */
  private sanitizeDelhiveryText(value: unknown): string {
    return String(value ?? '')
      .replace(DELHIVERY_FORBIDDEN_CHARS, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * JSON.stringify drops trailing zeros (350.0 → 350). Delhivery expects
   * weight/dimensions as floats with two decimal places (350.00, 17.00, …).
   */
  private stringifyManifestData(dataPayload: Record<string, unknown>): string {
    return JSON.stringify(dataPayload).replace(
      /"(weight|shipment_length|shipment_width|shipment_height)":(-?\d+)(?!\.)/g,
      (_, key: string, intPart: string) =>
        `"${key}":${Number(intPart).toFixed(2)}`,
    );
  }

  private truncateForLog(value: unknown): string {
    const raw =
      typeof value === 'string' ? value : JSON.stringify(value ?? null);
    if (!raw) return '';
    return raw.length > MANIFEST_RESPONSE_LOG_MAX
      ? `${raw.slice(0, MANIFEST_RESPONSE_LOG_MAX)}…[truncated]`
      : raw;
  }

  private parseYnFlag(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const v = value.trim().toUpperCase();
      return v === 'Y' || v === 'YES' || v === 'TRUE' || v === '1';
    }
    return false;
  }

  /**
   * Delhivery pincode serviceability.
   * GET {PINCODE_SERVICEABILITY_URL}?filter_codes={pincode}
   */
  async checkPincodeServiceability(
    pincode: string,
  ): Promise<PincodeServiceabilityResult> {
    const pin = String(pincode || '').trim();
    if (!/^\d{6}$/.test(pin)) {
      return { status: 'ok', prepaid: false, cod: false };
    }

    if (!this.apiKey || !this.pincodeServiceabilityUrl) {
      return {
        status: 'unavailable',
        reason: 'Delhivery serviceability is not configured',
      };
    }

    const base = this.pincodeServiceabilityUrl.replace(/\?$/, '');
    const url = `${base}${base.includes('?') ? '&' : '?'}filter_codes=${encodeURIComponent(pin)}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<unknown>(url, {
          headers: {
            Authorization: `Token ${this.apiKey}`,
            Accept: 'application/json',
          },
          timeout: 10000,
        }),
      );

      const data = response.data;
      if (
        typeof data === 'string' &&
        (data.trimStart().toLowerCase().startsWith('<!') ||
          data.includes('<html'))
      ) {
        this.logger.warn(
          `Delhivery serviceability returned HTML for pin ${pin}`,
        );
        return {
          status: 'unavailable',
          reason: 'Unexpected HTML response from Delhivery',
        };
      }

      const payload = data as {
        delivery_codes?: Array<{
          postal_code?: {
            pin?: string | number;
            prepaid?: string | boolean;
            pre_paid?: string | boolean;
            cod?: string | boolean;
            cash?: string | boolean;
            city?: string;
            district?: string;
            state_code?: string;
            state?: string;
          };
        }>;
        rmks?: string;
        rmk?: string;
      };

      const codes = Array.isArray(payload?.delivery_codes)
        ? payload.delivery_codes
        : [];
      if (codes.length === 0) {
        return { status: 'ok', prepaid: false, cod: false };
      }

      const match =
        codes.find((c) => String(c?.postal_code?.pin ?? '') === pin) ??
        codes[0];
      const postal = match?.postal_code;
      if (!postal) {
        return { status: 'ok', prepaid: false, cod: false };
      }

      const prepaid =
        this.parseYnFlag(postal.pre_paid) || this.parseYnFlag(postal.prepaid);
      const cod =
        this.parseYnFlag(postal.cod) || this.parseYnFlag(postal.cash);

      const city =
        typeof postal.city === 'string' ? postal.city.trim() : undefined;
      const district =
        typeof postal.district === 'string'
          ? postal.district.trim()
          : undefined;
      const stateCode =
        typeof postal.state_code === 'string'
          ? postal.state_code.trim().toUpperCase()
          : undefined;
      const stateFromApi =
        typeof postal.state === 'string' ? postal.state.trim() : undefined;
      const state =
        stateFromApi ||
        (stateCode ? DELHIVERY_STATE_CODE_TO_NAME[stateCode] : undefined);

      return {
        status: 'ok',
        prepaid,
        cod,
        city: city || undefined,
        district: district || undefined,
        stateCode,
        state,
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.message || 'Delhivery serviceability request failed';
      this.logger.warn(
        `Delhivery serviceability unavailable for pin ${pin}: status=${status ?? 'n/a'} ${message}`,
      );
      return { status: 'unavailable', reason: message };
    }
  }

  async assertPincodeDeliverable(
    pincode: string,
    opts: AssertPincodeDeliverableOptions = {},
  ): Promise<'verified' | 'unverified'> {
    const {
      requireCod = false,
      allowUnverified = false,
      acknowledgeUnverified = false,
    } = opts;

    const result = await this.checkPincodeServiceability(pincode);

    if (result.status === 'unavailable') {
      if (allowUnverified && acknowledgeUnverified) {
        return 'unverified';
      }
      throw new BadRequestException({
        success: false,
        message:
          'We temporarily can’t verify delivery for this pincode. You can still continue.',
        type: ERR_TYPES.pincode_serviceability_unavailable,
        code: ERR_TYPES.pincode_serviceability_unavailable,
      });
    }

    if (!result.prepaid) {
      throw new BadRequestException({
        success: false,
        message: 'Delivery is not available for this pincode.',
        type: 'BAD_REQUEST',
      });
    }

    if (requireCod && !result.cod) {
      throw new BadRequestException({
        success: false,
        message: 'Cash on Delivery is not available for this pincode.',
        type: 'BAD_REQUEST',
      });
    }

    return 'verified';
  }

  async createShipment(order: OrderForShipment): Promise<CreateShipmentResult> {
    if (!this.apiKey) {
      throw new Error('DELIVERY_API_KEY is not configured');
    }
    if (!this.manifestOrderUrl) {
      throw new Error('MANIFEST_ORDER_API is not configured');
    }

    const pickupLocation = (
      this.configService.get<string>('DELIVERY_PICKUP_LOCATION') || ''
    ).trim();
    const clientName = (
      this.configService.get<string>('DELIVERY_CLIENT_NAME') || ''
    ).trim();
    if (!pickupLocation) {
      throw new Error('DELIVERY_PICKUP_LOCATION must be configured');
    }

    if (!order.address) {
      throw new Error('Order has no shipping address');
    }

    const companyInfo = await this.prisma.companyInfo.findFirst({
      orderBy: { created_at: 'desc' },
    });
    if (!companyInfo?.gstin) {
      throw new Error('Company GSTIN not configured');
    }

    const invoiceTax = await this.prisma.invoiceTax.findFirst({
      where: { hsn_code: { not: null } },
    });
    const hsnCode = invoiceTax?.hsn_code ?? '9004';

    const invoice = await this.prisma.invoice.findUnique({
      where: { order_id: order.id },
      select: {
        invoice_number: true,
        status: true,
        issued_date: true,
        created_at: true,
      },
    });
    const usableInvoice =
      invoice && invoice.status !== InvoiceStatus.void ? invoice : null;
    const invoiceNumber = usableInvoice?.invoice_number ?? null;
    const sellerInvSlug = invoiceNumber
      ? sanitizeInvoiceForDelhivery(invoiceNumber)
      : '';
    const delhiveryOrderRef = buildDelhiveryOrderRef(order.id, invoiceNumber);
    const sellerInv = sellerInvSlug || `INV-${order.id}`;
    const sellerInvDate = formatSellerInvDate(
      usableInvoice?.issued_date ?? usableInvoice?.created_at,
    );

    const nameParts = (order.user.name || 'Customer').trim().split(/\s+/);
    const firstName = nameParts[0] ?? 'Customer';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const consigneeName = this.sanitizeDelhiveryText(
      `${firstName} ${lastName}`,
    );

    // Forward only: COD | Prepaid (not Pre-paid). Pickup/REPL are reverse/replacement.
    const orderTotal =
      Math.round(Number(order.pricing?.total ?? 0) * 100) / 100;
    const paymentMode = order.payment?.mode === 'cod' ? 'COD' : 'Prepaid';
    const codAmount = paymentMode === 'COD' ? orderTotal : 0;

    const products = order.order_items
      .filter((item) =>
        isActiveOrderLine(item as { admin_cancelled_at?: Date | null }),
      )
      .map((item) => {
        const pc = item.product_color as {
          model_number?: string;
          product?: { model_name?: string };
        };
        const name = this.sanitizeDelhiveryText(
          pc?.product?.model_name || pc?.model_number || 'Product',
        );
        const qty = item.quantity ?? 1;
        const price = item.price ?? 0;
        return `${name}:${qty}:${price}`;
      })
      .join(',');

    const street = this.sanitizeDelhiveryText(order.address.address);
    const city = this.sanitizeDelhiveryText(order.address.city);
    const state = this.sanitizeDelhiveryText(order.address.state);
    const pin = String(order.address.zip_code || '').trim();
    const phone = String(order.user.phone_number || '9999999999').trim();

    if (!street || !pin || !phone) {
      throw new Error(
        'Delhivery manifest requires address (add), pin, and phone',
      );
    }

    const shipment: Record<string, unknown> = {
      name: consigneeName || 'Customer',
      add: street,
      city: city || 'NA',
      state: state || 'NA',
      country: 'India',
      pin,
      phone,
      order: delhiveryOrderRef,
      payment_mode: paymentMode,
      products,
      seller_inv: sellerInv,
      seller_inv_date: sellerInvDate,
      weight: DEFAULT_WEIGHT_GM,
      shipment_length: DEFAULT_LENGTH_CM,
      shipment_width: DEFAULT_WIDTH_CM,
      shipment_height: DEFAULT_HEIGHT_CM,
      packaging_type: 'box',
      seller_gst_tin: companyInfo.gstin,
      hsn_code: hsnCode,
      is_billing_same_as_shipping: true,
    };

    if (paymentMode === 'COD') {
      shipment.cod_amount = codAmount;
      if (codAmount <= 0) {
        this.logger.warn(
          `COD order ${order.id} has zero or invalid total: ${order.pricing?.total}. Delhivery may reject.`,
        );
      }
    }
    shipment.total_amount = orderTotal;

    const dataPayload: Record<string, unknown> = {
      shipments: [shipment],
      pickup_location: { name: pickupLocation },
    };
    if (clientName) {
      dataPayload.client = clientName;
    }

    const payload = {
      format: 'json',
      data: this.stringifyManifestData(dataPayload),
    };

    let manifestHost = this.manifestOrderUrl;
    try {
      manifestHost = new URL(this.manifestOrderUrl).host;
    } catch {
      // keep raw URL for logs if invalid
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<DelhiveryManifestResponse>(
          this.manifestOrderUrl,
          new URLSearchParams(payload).toString(),
          {
            headers: {
              Authorization: `Token ${this.apiKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        ),
      );

      const data: DelhiveryManifestResponse = response.data ?? {};
      const pack = data.packages?.[0];
      const waybill =
        typeof pack?.waybill === 'string' && pack.waybill.trim()
          ? pack.waybill.trim()
          : null;
      this.logger.log(
        `Delhivery manifest order=${order.id} host=${manifestHost} status=${response.status} success=${data.success} waybill=${waybill ?? 'n/a'}`,
      );

      const rmks = data.rmk ?? data.rmks ?? data.Remark ?? data.Error;
      const remarks = pack?.remarks;

      if (data.success === false || !waybill) {
        const msg =
          Array.isArray(remarks) && remarks.filter(Boolean).length
            ? remarks.filter(Boolean).join('; ')
            : rmks || 'No waybill in Delhivery response';
        this.logActivity(
          'delhivery_manifest_api',
          String(waybill || order.id),
          order.id,
          {
            error: msg,
            host: manifestHost,
            status: response.status,
            response: data,
            payment_mode: paymentMode,
          },
          { type: 'ERROR', title: 'Delhivery Manifest API - Rejected' },
        );
        throw new Error(msg);
      }

      this.logActivity(
        'delhivery_manifest_api',
        waybill,
        order.id,
        {
          host: manifestHost,
          status: response.status,
          response: data,
          payment_mode: paymentMode,
          success: true,
          refnum: pack?.refnum,
          upload_wbn: data.upload_wbn,
          sort_code: pack?.sort_code,
        },
        { type: 'SUCCESS', title: 'Delhivery Manifest API' },
      );

      const trackingUrl = this.buildTrackingUrl(waybill);
      const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      return {
        waybill_number: waybill,
        tracking_url: trackingUrl,
        estimated_delivery: estimatedDelivery,
        refnum: pack?.refnum,
        upload_wbn: data.upload_wbn,
        sort_code: pack?.sort_code,
        payment: pack?.payment,
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      // Business rejection already logged above (thrown Error without Axios response)
      if (!err?.response) {
        this.logger.error(
          `Delhivery createShipment failed order=${order.id}: ${err?.message || 'unknown'}`,
        );
        throw error instanceof Error ? error : new Error(String(err?.message));
      }

      const errData = err.response.data as
        | { rmks?: string; rmk?: string }
        | string
        | undefined;
      const msg =
        (typeof errData === 'object' && errData
          ? errData.rmks || errData.rmk
          : undefined) ||
        err?.message ||
        'Delhivery API failed';

      this.logger.error(
        `Delhivery manifest failed order=${order.id} host=${manifestHost} status=${err.response.status ?? 'n/a'} body=${this.truncateForLog(errData ?? msg)}`,
      );
      this.logActivity(
        'delhivery_manifest_api',
        order.id,
        order.id,
        {
          error: msg,
          host: manifestHost,
          status: err.response.status,
          response: errData ?? msg,
        },
        { type: 'ERROR', title: 'Delhivery Manifest API - Failed' },
      );
      throw new Error(msg);
    }
  }
}
