import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  InvoiceStatus,
  OrderStatus,
  PaymentMode,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import dayjs from '../../lib/custom-dayjs';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { PincodeService } from '../address/pincode.service';
import { computeGstLumpBreakdown } from '../order/gst-lump-breakdown';
import { OrderService } from '../order/order.service';
import { InventoryService } from '../inventory/inventory.service';
import * as ExcelJS from 'exceljs';

/** GST portion split + other taxes + rounding; attached to invoice JSON for admin UI. */
export type GstInvoiceSummary = {
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  total_gst_portion: number;
  other_tax_total: number;
  tax_total_all: number;
  rounded_by: number;
  is_intra_state: boolean;
};

type ExportSkipReport = {
  exportedCount: number;
  skippedNoInvoiceOrderIds: string[];
  skippedVoidOrderIds: string[];
  truncated?: boolean;
};

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogger: ActivityLoggerService,
    private readonly pincodeService: PincodeService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly inventoryService: InventoryService,
  ) {}

  private isDeliveryInUP(zipCode?: string | null): boolean {
    if (!zipCode) return false;
    try {
      const pincodeData = this.pincodeService.getPincodeData(zipCode);
      return pincodeData.some(
        (data) =>
          data.State.toLowerCase() === 'uttar pradesh' ||
          data.State.toLowerCase() === 'up',
      );
    } catch {
      return false;
    }
  }

  /**
   * Sum GST vs other from line taxes; apply same lump breakdown as checkout.
   */
  attachGstSummary<T extends { invoice_items?: any[]; order?: { address?: { zip_code?: string | null } | null } | null }>(
    invoice: T,
  ): T & { gst_summary: GstInvoiceSummary } {
    const items = invoice.invoice_items || [];
    let gstOnly = 0;
    let other = 0;
    for (const item of items) {
      if (item.cancelled_at) continue;
      for (const t of item.taxes || []) {
        const amt = Number(t.tax_amount || 0);
        if (String(t.tax_type) === 'GST') {
          gstOnly += amt;
        } else {
          other += amt;
        }
      }
    }
    const zip = invoice.order?.address?.zip_code ?? null;
    const isIntra = this.isDeliveryInUP(zip);
    const breakdown = computeGstLumpBreakdown(gstOnly, isIntra);
    const gst_summary: GstInvoiceSummary = {
      cgst_total: breakdown.cgst,
      sgst_total: breakdown.sgst,
      igst_total: breakdown.igst,
      total_gst_portion: breakdown.total_gst,
      other_tax_total: other,
      tax_total_all: breakdown.total_gst + other,
      rounded_by: breakdown.rounded_by,
      is_intra_state: isIntra,
    };
    return { ...invoice, gst_summary };
  }

  private getFinancialYear(date: Date = new Date()): string {
    const now = dayjs(date).tz('Asia/Kolkata');
    const year = now.year();
    const month = now.month(); // 0-indexed
    const fyStartYear = month >= 3 ? year : year - 1;
    const start = String(fyStartYear % 100).padStart(2, '0');
    const end = String((fyStartYear + 1) % 100).padStart(2, '0');
    return `${start}-${end}`;
  }

  private async getNextInvoiceSequence(financialYear: string): Promise<number> {
    const now = new Date();
    const result = (await this.prisma.$runCommandRaw({
      findAndModify: 'InvoiceSequence',
      query: { financial_year: financialYear },
      update: {
        $inc: { last_number: 1 },
        $set: { updated_at: now },
        $setOnInsert: {
          financial_year: financialYear,
          created_at: now,
        },
      },
      upsert: true,
      new: true,
    })) as { value?: { last_number?: number } };

    const sequence = result?.value?.last_number;
    if (!sequence) {
      throw new Error('Failed to allocate invoice sequence');
    }
    return sequence;
  }

  private formatInvoiceNumber(financialYear: string, sequence: number): string {
    return `AKC/${financialYear}/${String(sequence).padStart(2, '0')}`;
  }

  private getCouponDiscount(orderPricing: any): number {
    const appliedCoupon = orderPricing?.applied_coupon as
      | { discount?: number }
      | null
      | undefined;
    return Number(appliedCoupon?.discount || 0);
  }

  private getInitialInvoiceStatus(order: any): InvoiceStatus {
    if (order?.status === 'cancelled') {
      return InvoiceStatus.void;
    }
    if (
      order?.payment?.mode === PaymentMode.online &&
      order?.payment?.status === PaymentStatus.completed
    ) {
      return InvoiceStatus.paid;
    }
    if (
      order?.payment?.mode === PaymentMode.cod &&
      order?.status === 'delivered'
    ) {
      return InvoiceStatus.paid;
    }
    return InvoiceStatus.unpaid;
  }

  async getCompanyInfo() {
    return await this.prisma.companyInfo.findFirst({
      orderBy: { created_at: 'desc' },
    });
  }

  async createInvoiceFromOrder(orderId: string, userId: string) {
    try {
      return await this.createInvoiceFromOrderInternal(orderId);
    } catch (error: any) {
      this.activityLogger.logError(
        'Invoice: creation failed',
        error?.message,
        { source: 'invoice', order_id: orderId, user_id: userId },
        userId,
      );
      throw error;
    }
  }

  private async createInvoiceFromOrderInternal(orderId: string) {
    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { order_id: orderId },
      include: {
        invoice_items: {
          include: {
            taxes: true,
          },
        },
        order: {
          include: {
            address: true,
          },
        },
      },
    });

    if (existingInvoice) {
      return this.attachGstSummary(existingInvoice);
    }

    // Fetch order with all related data
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: {
            taxes: true,
          },
        },
        pricing: true,
        payment: true,
        user: true,
        address: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const financialYear = this.getFinancialYear();
    const sequence = await this.getNextInvoiceSequence(financialYear);
    const invoiceNumber = this.formatInvoiceNumber(financialYear, sequence);
    const couponDiscount = this.getCouponDiscount(order.pricing);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        invoice_number: invoiceNumber,
        financial_year: financialYear,
        sequence_number: sequence,
        order_id: orderId,
        status: this.getInitialInvoiceStatus(order),
        issued_date: new Date(),
        subtotal: order.pricing?.subtotal || 0,
        tax_total: 0,
        gst_rounded_by: 0,
        discount_on_mrp_total: order.pricing?.discount_on_mrp || 0,
        coupon_discount_total: couponDiscount,
        shipping_total: order.pricing?.shipping_price || 0,
        grand_total: order.pricing?.total || 0,
        notes: order.notes,
        paid_at: this.getInitialInvoiceStatus(order) === InvoiceStatus.paid ? new Date() : null,
      },
    });

    // Create invoice items from order items
    await Promise.all(
      order.order_items.filter((oi) => !oi.admin_cancelled_at).map(async (orderItem) => {
        const productColor = orderItem.product_color as any;
        const itemTaxAmount = (orderItem.taxes || []).reduce(
          (sum, tax) => sum + Number(tax.tax_amount || 0),
          0,
        );

        const invoiceItem = await this.prisma.invoiceItem.create({
          data: {
            invoice_id: invoice.id,
            order_item_id: orderItem.id,
            product_name: productColor?.product?.model_name || 'Product',
            product_sku: productColor?.model_number || 'N/A',
            product_color: orderItem.product_color,
            power_type: orderItem.power_type,
            lens_feature: orderItem.lens_feature,
            lens_detail: orderItem.lens_detail,
            frame_only: orderItem.frame_only,
            unit_price: orderItem.price || 0,
            quantity: orderItem.quantity,
            subtotal: (orderItem.price || 0) * orderItem.quantity,
            discount_amount: orderItem.discount || 0,
            tax_amount: itemTaxAmount,
            total_amount: ((orderItem.price || 0) * orderItem.quantity) - (orderItem.discount || 0),
          },
        });

        // Create tax entries for this invoice item
        if (orderItem.taxes && orderItem.taxes.length > 0) {
          await Promise.all(
            orderItem.taxes.map(async (tax) => {
              await this.prisma.invoiceItemTax.create({
                data: {
                  invoice_item_id: invoiceItem.id,
                  tax_name: tax.name || 'Tax',
                  tax_type: tax.tax_type,
                  tax_rate: tax.tax_rate,
                  tax_amount: tax.tax_amount,
                  tax_description: `Tax on ${productColor?.product?.model_name || 'Product'}`,
                },
              });
            }),
          );
        }
      }),
    );

    let totalGstOnly = 0;
    let totalOtherTax = 0;
    for (const oi of order.order_items) {
      if (oi.admin_cancelled_at) continue;
      for (const t of oi.taxes || []) {
        const amt = Number(t.tax_amount || 0);
        if (String(t.tax_type) === 'GST') {
          totalGstOnly += amt;
        } else {
          totalOtherTax += amt;
        }
      }
    }
    const isIntra = this.isDeliveryInUP(order.address?.zip_code ?? null);
    const breakdown = computeGstLumpBreakdown(totalGstOnly, isIntra);
    const taxTotalAll = breakdown.total_gst + totalOtherTax;

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        tax_total: taxTotalAll,
        gst_rounded_by: breakdown.rounded_by,
      },
    });

    // Return complete invoice with items
    return this.getInvoiceById(invoice.id);
  }

  private invoiceDetailInclude = {
    order: {
      include: {
        user: true,
        address: true,
        pricing: true,
        payment: true,
      },
    },
    invoice_items: {
      include: {
        taxes: true,
      },
    },
  } as const;

  /**
   * Cart/checkout historically omitted `lens_id` on embedded lens_detail JSON.
   * Merge LensDetail.lens_id from DB when we have lens_detail.id but no lens_id.
   */
  private async hydrateInvoiceItemLensIds(
    invoice: { invoice_items?: Array<{ lens_detail?: unknown }> },
  ): Promise<void> {
    const items = invoice.invoice_items;
    if (!items?.length) return;

    const detailIds = new Set<string>();
    for (const it of items) {
      const ld = it.lens_detail as Record<string, unknown> | null | undefined;
      if (!ld || typeof ld !== 'object') continue;
      const id = ld['id'];
      const lensId =
        typeof ld['lens_id'] === 'string' ? ld['lens_id'].trim() : '';
      if (lensId) continue;
      if (typeof id === 'string' && id.trim()) {
        detailIds.add(id.trim());
      }
    }

    if (detailIds.size === 0) return;

    const rows = await this.prisma.lensDetail.findMany({
      where: { id: { in: [...detailIds] } },
      select: { id: true, lens_id: true },
    });
    const map = new Map(rows.map((r) => [r.id, r.lens_id]));

    for (const it of items) {
      const ld = it.lens_detail as Record<string, unknown> | null | undefined;
      if (!ld || typeof ld !== 'object') continue;
      const id = typeof ld['id'] === 'string' ? ld['id'].trim() : '';
      const existing =
        typeof ld['lens_id'] === 'string' ? ld['lens_id'].trim() : '';
      if (existing || !id) continue;
      const lensId = map.get(id);
      if (lensId?.trim()) {
        it.lens_detail = { ...ld, lens_id: lensId };
      }
    }
  }

  async getInvoiceById(invoiceId: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: this.invoiceDetailInclude,
    });
    if (!inv) return null;
    await this.hydrateInvoiceItemLensIds(inv);
    return this.attachGstSummary(inv);
  }

  async getInvoiceByOrderId(orderId: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { order_id: orderId },
      include: this.invoiceDetailInclude,
    });
    if (!inv) return null;
    await this.hydrateInvoiceItemLensIds(inv);
    return this.attachGstSummary(inv);
  }

  private summarizeLineTaxes(taxes: Array<{ tax_name?: string | null; tax_amount?: number }>) {
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let other = 0;

    for (const tax of taxes || []) {
      const amount = Number(tax.tax_amount || 0);
      const name = String(tax.tax_name || '').toLowerCase();
      if (name.includes('cgst')) cgst += amount;
      else if (name.includes('sgst')) sgst += amount;
      else if (name.includes('igst')) igst += amount;
      else other += amount;
    }

    return { cgst, sgst, igst, other };
  }

  /** Sum of (line subtotal − line discount) for non-cancelled invoice lines — GST taxable base. */
  private sumActiveInvoiceTaxable(items: Array<{
    cancelled_at?: Date | null;
    subtotal?: number | null;
    discount_amount?: number | null;
  }>): number {
    let sum = 0;
    for (const it of items || []) {
      if (it.cancelled_at) continue;
      sum +=
        Number(it.subtotal ?? 0) - Number(it.discount_amount ?? 0);
    }
    return sum;
  }

  private formatGstRateNumber(rate: number): string {
    const n = Math.round(rate * 100) / 100;
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  /**
   * Statutory GST % from line taxes (`tax_type === GST`), else effective % from lump GST ÷ taxable base.
   */
  private deriveInvoiceGstRateDisplay(inv: {
    invoice_items?: Array<{
      cancelled_at?: Date | null;
      taxes?: Array<{
        tax_type?: string | null;
        tax_rate?: number | null;
      }>;
    }>;
    gst_summary?: GstInvoiceSummary;
  }): string {
    const rateNums = new Set<number>();
    for (const item of inv.invoice_items || []) {
      if (item.cancelled_at) continue;
      for (const t of item.taxes || []) {
        if (String(t.tax_type) !== 'GST') continue;
        const r = Number(t.tax_rate ?? 0);
        if (r > 0) rateNums.add(r);
      }
    }
    if (rateNums.size > 0) {
      return [...rateNums]
        .sort((a, b) => a - b)
        .map((r) => `${this.formatGstRateNumber(r)}%`)
        .join(', ');
    }
    const taxable = this.sumActiveInvoiceTaxable(inv.invoice_items || []);
    const gst = Number(inv.gst_summary?.total_gst_portion ?? 0);
    if (taxable > 0 && gst > 0) {
      const eff = (gst / taxable) * 100;
      return `${this.formatGstRateNumber(eff)}%`;
    }
    return '';
  }

  /** Prefer state name from pincode dataset when zip is known; else saved address state. */
  private displayStateForInvoice(
    zip: string | null | undefined,
    savedState: string | null | undefined,
  ): string {
    const z = (zip ?? '').trim();
    if (z) {
      try {
        const rows = this.pincodeService.getPincodeData(z);
        if (rows.length) return rows[0].State;
      } catch {
        /* pincode DB may be unavailable */
      }
    }
    return (savedState ?? '').trim();
  }

  async exportInvoicesAccounting(orderIds: string[]) {
    const uniqueOrderIds = [...new Set(orderIds)];
    const invoices = await this.prisma.invoice.findMany({
      where: { order_id: { in: uniqueOrderIds } },
      include: this.invoiceDetailInclude,
      orderBy: { created_at: 'desc' },
    });

    const invoiceByOrderId = new Map(invoices.map((inv) => [inv.order_id, inv]));
    const skippedNoInvoice: string[] = [];
    const skippedVoid: string[] = [];
    const eligibleInvoices: any[] = [];

    for (const orderId of uniqueOrderIds) {
      const invoice = invoiceByOrderId.get(orderId);
      if (!invoice) {
        skippedNoInvoice.push(orderId);
        continue;
      }
      if (invoice.status === InvoiceStatus.void) {
        skippedVoid.push(orderId);
        continue;
      }
      await this.hydrateInvoiceItemLensIds(invoice);
      eligibleInvoices.push(this.attachGstSummary(invoice));
    }

    if (eligibleInvoices.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'No exportable invoices found for selected orders.',
        skipped_no_invoice_order_ids: skippedNoInvoice,
        skipped_void_order_ids: skippedVoid,
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Akku Ka Chashma';
    workbook.created = new Date();

    const invoicesSheet = workbook.addWorksheet('Invoices');
    invoicesSheet.columns = [
      { header: 'Invoice Number', key: 'invoice_number', width: 20 },
      { header: 'Order ID', key: 'order_id', width: 26 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'State', key: 'state', width: 22 },
      { header: 'GST Rate', key: 'gst_rate', width: 14 },
      { header: 'Taxable Value', key: 'taxable_value', width: 16 },
      { header: 'CGST', key: 'cgst', width: 12 },
      { header: 'SGST', key: 'sgst', width: 12 },
      { header: 'IGST', key: 'igst', width: 12 },
      { header: 'Invoice Value', key: 'invoice_value', width: 16 },
    ];

    const lineSheet = workbook.addWorksheet('Line_items');
    lineSheet.columns = [
      { header: 'Invoice Number', key: 'invoice_number', width: 20 },
      { header: 'Issued Date', key: 'issued_date', width: 16 },
      { header: 'Order ID', key: 'order_id', width: 26 },
      { header: 'Product Name', key: 'product_name', width: 30 },
      { header: 'Product SKU', key: 'product_sku', width: 16 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unit_price', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Discount Amount', key: 'discount_amount', width: 14 },
      { header: 'Tax Amount', key: 'tax_amount', width: 12 },
      { header: 'CGST', key: 'cgst_amount', width: 12 },
      { header: 'SGST', key: 'sgst_amount', width: 12 },
      { header: 'IGST', key: 'igst_amount', width: 12 },
      { header: 'Other Taxes', key: 'other_tax_amount', width: 14 },
      { header: 'Line Total', key: 'total_amount', width: 12 },
    ];

    for (const inv of eligibleInvoices) {
      const taxableValue = this.sumActiveInvoiceTaxable(inv.invoice_items || []);
      invoicesSheet.addRow({
        invoice_number: inv.invoice_number,
        order_id: inv.order_id,
        date: dayjs(inv.issued_date).format('YYYY-MM-DD'),
        state: this.displayStateForInvoice(
          inv.order?.address?.zip_code,
          inv.order?.address?.state,
        ),
        gst_rate: this.deriveInvoiceGstRateDisplay(inv),
        taxable_value: taxableValue,
        cgst: Number(inv.gst_summary?.cgst_total || 0),
        sgst: Number(inv.gst_summary?.sgst_total || 0),
        igst: Number(inv.gst_summary?.igst_total || 0),
        invoice_value: Number(inv.grand_total || 0),
      });

      for (const item of inv.invoice_items || []) {
        if (item.cancelled_at) continue;
        const taxBreakdown = this.summarizeLineTaxes(item.taxes || []);
        lineSheet.addRow({
          invoice_number: inv.invoice_number,
          issued_date: dayjs(inv.issued_date).format('YYYY-MM-DD'),
          order_id: inv.order_id,
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          subtotal: Number(item.subtotal || 0),
          discount_amount: Number(item.discount_amount || 0),
          tax_amount: Number(item.tax_amount || 0),
          cgst_amount: Number(taxBreakdown.cgst || 0),
          sgst_amount: Number(taxBreakdown.sgst || 0),
          igst_amount: Number(taxBreakdown.igst || 0),
          other_tax_amount: Number(taxBreakdown.other || 0),
          total_amount: Number(item.total_amount || 0),
        });
      }
    }

    const raw = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
    const listCap = 30;
    const skipReport: ExportSkipReport = {
      exportedCount: eligibleInvoices.length,
      skippedNoInvoiceOrderIds: skippedNoInvoice.slice(0, listCap),
      skippedVoidOrderIds: skippedVoid.slice(0, listCap),
      truncated:
        skippedNoInvoice.length > listCap || skippedVoid.length > listCap,
    };

    return {
      buffer,
      skipReport,
      fileName: `invoice-export-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`,
    };
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        order_id: true,
        order: {
          select: {
            status: true,
            payment: {
              select: {
                status: true,
                paid_at: true,
              },
            },
          },
        },
      },
    });
    if (!inv) {
      throw new NotFoundException('Invoice not found');
    }
    if (inv.order?.status === OrderStatus.cancelled) {
      throw new BadRequestException(
        'Cannot change invoice status because the order is already cancelled.',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status,
          paid_at: status === InvoiceStatus.paid ? new Date() : null,
          voided_at: status === InvoiceStatus.void ? new Date() : null,
        },
      });

      const paymentData: Prisma.OrderPaymentUpdateInput =
        status === InvoiceStatus.paid
          ? {
              status: PaymentStatus.completed,
              paid_at: inv.order?.payment?.paid_at || new Date(),
            }
          : status === InvoiceStatus.unpaid
            ? {
                status: PaymentStatus.pending,
                paid_at: null,
              }
            : {
                status: PaymentStatus.failed,
                paid_at: null,
              };

      await tx.orderPayment.update({
        where: { order_id: inv.order_id },
        data: paymentData,
      });

      return updatedInvoice;
    });
  }

  /**
   * Persists tax_total / gst_rounded_by / grand_total / subtotal from non-cancelled invoice lines.
   */
  private async recomputeStoredInvoiceTotals(
    invoiceId: string,
    orderZip: string | null,
    tx: Prisma.TransactionClient,
  ) {
    const inv = await tx.invoice.findUnique({
      where: { id: invoiceId },
      select: { shipping_total: true },
    });
    const ship = Number(inv?.shipping_total || 0);

    const items = await tx.invoiceItem.findMany({
      where: { invoice_id: invoiceId },
      include: { taxes: true },
    });
    const active = items.filter((i) => !i.cancelled_at);

    let totalGstOnly = 0;
    let totalOtherTax = 0;
    for (const it of active) {
      for (const t of it.taxes || []) {
        const amt = Number(t.tax_amount || 0);
        if (String(t.tax_type) === 'GST') {
          totalGstOnly += amt;
        } else {
          totalOtherTax += amt;
        }
      }
    }
    const breakdown = computeGstLumpBreakdown(
      totalGstOnly,
      this.isDeliveryInUP(orderZip),
    );
    const grand =
      active.reduce((s, i) => s + Number(i.total_amount || 0), 0) + ship;
    const subtotalAgg = active.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        tax_total: breakdown.total_gst + totalOtherTax,
        gst_rounded_by: breakdown.rounded_by,
        grand_total: grand,
        subtotal: subtotalAgg,
      },
    });
  }

  /**
   * Admin: cancel one invoice line (not the last active line), sync order line, restore stock once, recompute totals.
   */
  async cancelInvoiceLine(
    invoiceId: string,
    invoiceItemId: string,
    adminUserId: string,
    reason?: string,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        invoice_items: true,
        order: { include: { address: true } },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status === InvoiceStatus.void) {
      throw new BadRequestException('Cannot cancel lines on a void invoice');
    }

    const line = invoice.invoice_items.find((i) => i.id === invoiceItemId);
    if (!line) {
      throw new NotFoundException('Invoice line not found');
    }
    if (line.cancelled_at) {
      throw new BadRequestException('Line already cancelled');
    }
    if (!line.order_item_id) {
      throw new BadRequestException(
        'Invoice line is missing order_item_id (legacy invoice). Recreate the invoice or migrate data.',
      );
    }

    const activeLines = invoice.invoice_items.filter((i) => !i.cancelled_at);
    if (activeLines.length <= 1) {
      throw new BadRequestException(
        'Cannot cancel the last line on the invoice. Cancel the order instead to void the invoice.',
      );
    }

    const zip = invoice.order?.address?.zip_code ?? null;
    const needStockRestore = !line.stock_restored_at;
    const pc = line.product_color as { id?: string } | null;
    const productColorId = pc?.id;
    if (needStockRestore && !productColorId) {
      throw new BadRequestException(
        'Cannot restore stock: invoice line is missing product_color.id',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.orderItem.update({
        where: { id: line.order_item_id! },
        data: {
          admin_cancelled_at: now,
          cancel_reason: reason ?? null,
        },
      });

      if (needStockRestore && productColorId) {
        await this.inventoryService.restoreStock(
          productColorId,
          line.quantity ?? 1,
          tx,
        );
      }

      await tx.invoiceItem.update({
        where: { id: invoiceItemId },
        data: {
          cancelled_at: now,
          cancel_reason: reason ?? null,
          ...(needStockRestore ? { stock_restored_at: new Date() } : {}),
        },
      });

      await this.recomputeStoredInvoiceTotals(invoiceId, zip, tx);
      await this.orderService.recalculatePricingForOrder(invoice.order_id, tx);
    });

    this.activityLogger.logInfo(
      'Invoice: line cancelled',
      `invoice=${invoiceId} item=${invoiceItemId}`,
      {
        source: 'invoice',
        invoice_id: invoiceId,
        invoice_item_id: invoiceItemId,
        order_id: invoice.order_id,
      },
      adminUserId,
    );

    return this.getInvoiceById(invoiceId);
  }

  async syncFromOrderLifecycle(orderId: string, prismaClient: any = this.prisma) {
    const [order, invoice] = await Promise.all([
      prismaClient.order.findUnique({
        where: { id: orderId },
        include: {
          payment: true,
        },
      }),
      prismaClient.invoice.findUnique({
        where: { order_id: orderId },
      }),
    ]);

    if (!order || !invoice) {
      return invoice;
    }

    let nextStatus: InvoiceStatus = InvoiceStatus.unpaid;
    if (order.status === 'cancelled') {
      nextStatus = InvoiceStatus.void;
    } else if (
      order.payment?.mode === PaymentMode.online &&
      order.payment?.status === PaymentStatus.completed
    ) {
      nextStatus = InvoiceStatus.paid;
    } else if (order.payment?.mode === PaymentMode.cod && order.status === 'delivered') {
      nextStatus = InvoiceStatus.paid;
    }

    const invoiceNeedsUpdate = invoice.status !== nextStatus;

    let paymentPatch: Prisma.OrderPaymentUpdateInput | null = null;
    if (nextStatus === InvoiceStatus.paid) {
      if (order.payment?.status !== PaymentStatus.completed) {
        paymentPatch = {
          status: PaymentStatus.completed,
          paid_at: order.payment?.paid_at || new Date(),
        };
      }
    } else if (nextStatus === InvoiceStatus.void) {
      // Cancelled orders should not remain "pending" for accounting visibility.
      if (order.payment?.status !== PaymentStatus.failed) {
        paymentPatch = {
          status: PaymentStatus.failed,
          paid_at: null,
        };
      }
    } else if (order.payment?.status === PaymentStatus.completed) {
      // Keep payment and invoice coherent when lifecycle regresses to unpaid.
      paymentPatch = {
        status: PaymentStatus.pending,
        paid_at: null,
      };
    }

    if (!invoiceNeedsUpdate && !paymentPatch) {
      return invoice;
    }

    if (paymentPatch) {
      await prismaClient.orderPayment.update({
        where: { order_id: orderId },
        data: paymentPatch,
      });
    }

    if (!invoiceNeedsUpdate) {
      return invoice;
    }

    return prismaClient.invoice.update({
      where: { id: invoice.id },
      data: {
        status: nextStatus,
        paid_at: nextStatus === InvoiceStatus.paid ? new Date() : null,
        voided_at: nextStatus === InvoiceStatus.void ? new Date() : null,
      },
    });
  }

  async getAllInvoices(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        skip,
        take: limit,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.invoice.count(),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
