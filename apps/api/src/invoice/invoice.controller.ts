import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Tenant } from '../auth/decorators/tenant.decorator';
import { InvoiceStatus } from '@prisma/client';
import { CancelInvoiceLineDto } from './dto/cancel-invoice-line.dto';
import { ExportInvoicesAccountingDto } from './dto/export-invoices-accounting.dto';
import { BulkDownloadInvoicesPdfDto } from './dto/bulk-download-invoices-pdf.dto';
import { GenerateInvoicePdfDto } from './dto/generate-invoice-pdf.dto';
import { Response } from 'express';

@Controller('invoices')
@ApiTags('Invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  /** Path avoids `invoices/order/:id` being parsed as invoiceId=order. */
  @Post('line/:invoiceId/:itemId/cancel')
  @Roles('admin')
  @ApiOperation({
    description:
      'Cancel one invoice line (not the last active line). Restores stock once, syncs order line and pricing.',
  })
  @ApiBody({ type: CancelInvoiceLineDto, required: false })
  async cancelInvoiceLine(
    @Param('invoiceId') invoiceId: string,
    @Param('itemId') itemId: string,
    @Body() body: CancelInvoiceLineDto,
    @Tenant() tenant: { id: string },
  ) {
    const invoice = await this.invoiceService.cancelInvoiceLine(
      invoiceId,
      itemId,
      tenant.id,
      body?.reason,
    );
    return {
      success: true,
      data: invoice,
    };
  }

  @Post('order/:orderId')
  @Roles('admin')
  @ApiOperation({ description: 'Create invoice from order' })
  async createInvoiceFromOrder(
    @Param('orderId') orderId: string,
    @Tenant() tenant: any,
  ) {
    const invoice = await this.invoiceService.createInvoiceFromOrder(
      orderId,
      tenant.id,
    );
    return {
      success: true,
      data: invoice,
    };
  }

  @Post('export/accounting')
  @Roles('admin')
  @ApiOperation({ description: 'Export selected orders to accountant XLSX' })
  @ApiBody({ type: ExportInvoicesAccountingDto })
  async exportInvoicesAccounting(
    @Body() body: ExportInvoicesAccountingDto,
    @Res() res: Response,
  ) {
    const result = await this.invoiceService.exportInvoicesAccounting(
      body.order_ids,
    );
    const hasSkips =
      result.skipReport.skippedNoInvoiceOrderIds.length > 0 ||
      result.skipReport.skippedVoidOrderIds.length > 0;

    const skipReportB64 = Buffer.from(
      JSON.stringify(result.skipReport),
      'utf8',
    ).toString('base64url');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    if (hasSkips) {
      res.setHeader('X-Export-Skip-Report', skipReportB64);
    }
    res.status(200).send(result.buffer);
  }

  @Post('bulk-pdf')
  @Roles('admin')
  @ApiOperation({
    description:
      'Download selected invoices as one PDF using client-rendered admin invoice HTML (same layout as single PDF).',
  })
  @ApiBody({ type: BulkDownloadInvoicesPdfDto })
  async bulkDownloadInvoicesPdf(
    @Body() body: BulkDownloadInvoicesPdfDto,
    @Res() res: Response,
  ) {
    const result = await this.invoicePdfService.generateBulkPdfFromClientHtml(
      body.invoices,
    );

    const skipReportB64 = Buffer.from(
      JSON.stringify(result.skipReport),
      'utf8',
    ).toString('base64url');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader('X-Export-Skip-Report', skipReportB64);
    res.status(200).send(result.buffer);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ description: 'Get all invoices with pagination' })
  async getAllInvoices(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const result = await this.invoiceService.getAllInvoices(
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('order/:orderId/with-company-info')
  @Roles('admin')
  @ApiOperation({ description: 'Get invoice by order ID with company info' })
  async getInvoiceByOrderIdWithCompanyInfo(@Param('orderId') orderId: string) {
    const [invoice, companyInfo] = await Promise.all([
      this.invoiceService.getInvoiceByOrderId(orderId),
      this.invoiceService.getCompanyInfo(),
    ]);

    return {
      success: true,
      data: {
        invoice,
        company_info: companyInfo,
      },
    };
  }

  @Get('order/:orderId')
  @Roles('admin')
  @ApiOperation({ description: 'Get invoice by order ID' })
  async getInvoiceByOrderId(@Param('orderId') orderId: string) {
    const invoice = await this.invoiceService.getInvoiceByOrderId(orderId);
    return {
      success: true,
      data: invoice,
    };
  }

  @Post(':id/pdf')
  @Roles('admin')
  @ApiOperation({
    description:
      'Download invoice PDF via Puppeteer using client-rendered HTML (preserves admin invoice layout).',
  })
  @ApiBody({ type: GenerateInvoicePdfDto })
  async downloadInvoicePdfFromHtml(
    @Param('id') id: string,
    @Body() body: GenerateInvoicePdfDto,
    @Res() res: Response,
  ) {
    const { buffer, fileName } =
      await this.invoicePdfService.generatePdfFromClientHtml(id, body.html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    res.status(200).send(buffer);
  }

  @Get(':id/pdf')
  @Roles('admin')
  @ApiOperation({
    description:
      'Download invoice PDF via Puppeteer using the server HTML template (fallback).',
  })
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, fileName } =
      await this.invoicePdfService.generatePdfByInvoiceId(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    res.status(200).send(buffer);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ description: 'Get invoice by ID' })
  async getInvoiceById(@Param('id') id: string) {
    const invoice = await this.invoiceService.getInvoiceById(id);
    return {
      success: true,
      data: invoice,
    };
  }

  @Post(':id/status')
  @Roles('admin')
  @ApiOperation({ description: 'Update invoice status' })
  async updateInvoiceStatus(
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatus },
  ) {
    const invoice = await this.invoiceService.updateInvoiceStatus(
      id,
      body.status,
    );
    return {
      success: true,
      data: invoice,
    };
  }
}
