import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PDFDocument } from 'pdf-lib';
import dayjs from '../../lib/custom-dayjs';
import { InvoiceService } from './invoice.service';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import {
  buildInvoiceHtml,
  InvoicePdfPayload,
} from './invoice-pdf.html';

type ExportSkipReport = {
  exportedCount: number;
  skippedNoInvoiceOrderIds: string[];
  skippedVoidOrderIds: string[];
  truncated?: boolean;
};

type ClientHtmlInvoice = {
  id: string;
  html: string;
};

@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  private async assertInvoicePdfable(invoiceId: string) {
    const invoice = await this.invoiceService.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status === InvoiceStatus.void) {
      throw new BadRequestException('Cannot generate PDF for a void invoice');
    }
    return invoice;
  }

  private async pdfFromHtml(
    html: string,
    fileName: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const buffer = await this.pdfService.htmlToPdf(html, {
      format: 'A5',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    return { buffer, fileName };
  }

  private async buildPayloadForInvoice(
    invoice: any,
    company_info: InvoicePdfPayload['company_info'],
  ): Promise<InvoicePdfPayload> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: invoice.order_id },
      select: { id: true, prescription: true },
    });
    const hydrated = await this.orderService.hydrateOrderItemPrescriptions(
      orderItems,
    );

    const prescriptionsByOrderItemId: Record<string, unknown> = {};
    for (const oi of hydrated) {
      prescriptionsByOrderItemId[oi.id] = oi.prescription ?? null;
    }

    return {
      invoice,
      company_info,
      prescriptionsByOrderItemId,
    };
  }

  private async mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
    const merged = await PDFDocument.create();
    for (const buf of buffers) {
      const doc = await PDFDocument.load(buf);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      for (const page of pages) {
        merged.addPage(page);
      }
    }
    const bytes = await merged.save();
    return Buffer.from(bytes);
  }

  /**
   * Preferred path: HTML rendered from the admin invoice UI (structure intact).
   */
  async generatePdfFromClientHtml(
    invoiceId: string,
    html: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const invoice = await this.assertInvoicePdfable(invoiceId);
    const trimmed = html?.trim();
    if (!trimmed || trimmed.length < 32) {
      throw new BadRequestException('Invoice HTML is required for PDF generation');
    }
    const safeNumber = String(invoice.invoice_number || invoice.id).replace(
      /[^\w.-]+/g,
      '_',
    );
    return this.pdfFromHtml(trimmed, `invoice-${safeNumber}.pdf`);
  }

  /**
   * Fallback when no client HTML is provided (server-built template).
   */
  async generatePdfByInvoiceId(
    invoiceId: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const invoice = await this.assertInvoicePdfable(invoiceId);
    const company_info = await this.invoiceService.getCompanyInfo();
    const payload = await this.buildPayloadForInvoice(invoice, company_info);
    const html = buildInvoiceHtml(payload);
    const safeNumber = String(invoice.invoice_number || invoice.id).replace(
      /[^\w.-]+/g,
      '_',
    );
    return this.pdfFromHtml(html, `invoice-${safeNumber}.pdf`);
  }

  /**
   * Bulk PDF from client-rendered admin invoice HTML (same path as single PDF).
   * Each document is Puppeteer-rendered separately then merged so pages match
   * single-invoice downloads exactly.
   */
  async generateBulkPdfFromClientHtml(
    items: ClientHtmlInvoice[],
  ): Promise<{
    buffer: Buffer;
    fileName: string;
    skipReport: ExportSkipReport;
  }> {
    if (!items?.length) {
      throw new BadRequestException({
        success: false,
        message: 'No exportable invoices found for selected orders.',
        skipped_no_invoice_order_ids: [],
        skipped_void_order_ids: [],
      });
    }

    const pdfBuffers: Buffer[] = [];
    for (const item of items) {
      const { buffer } = await this.generatePdfFromClientHtml(
        item.id,
        item.html,
      );
      pdfBuffers.push(buffer);
    }

    const buffer = await this.mergePdfBuffers(pdfBuffers);
    const fileName = `invoices-bulk-${dayjs().format('YYYYMMDD-HHmm')}.pdf`;

    return {
      buffer,
      fileName,
      skipReport: {
        exportedCount: pdfBuffers.length,
        skippedNoInvoiceOrderIds: [],
        skippedVoidOrderIds: [],
      },
    };
  }
}
