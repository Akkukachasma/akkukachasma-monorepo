import dayjs from '../../lib/custom-dayjs';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inr(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function titleOf(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const t = (json as Record<string, unknown>).title;
  return typeof t === 'string' ? t.trim() : '';
}

function lensIdOf(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const id = (json as Record<string, unknown>).lens_id;
  return typeof id === 'string' ? id.trim() : '';
}

function prescriptionHtml(rx: unknown): string {
  if (!rx || typeof rx !== 'object') {
    return '<p class="muted">No prescription on file.</p>';
  }
  const p = rx as Record<string, unknown>;
  if (p.type === 'photo') {
    const image = p.image;
    let url = '';
    if (typeof image === 'string') url = image;
    else if (image && typeof image === 'object') {
      url = String((image as { url?: string }).url || '');
    }
    const comments =
      typeof p.comments === 'string' && p.comments.trim()
        ? `<p class="muted">${esc(p.comments)}</p>`
        : '';
    if (!url) {
      return `<p class="muted">Prescription photo on file (URL unavailable).</p>${comments}`;
    }
    return `${comments}<img class="rx-img" src="${esc(url)}" alt="Prescription" />`;
  }

  if (p.type === 'fillup') {
    const rows = [
      ['', 'SPH', 'CYL', 'Axis', 'Add'],
      [
        'Right',
        p.right_sph,
        p.right_cyl,
        p.right_axis,
        p.right_add,
      ],
      ['Left', p.left_sph, p.left_cyl, p.left_axis, p.left_add],
    ];
    const body = rows
      .map(
        (r, i) =>
          `<tr>${r
            .map(
              (c) =>
                `<t${i === 0 ? 'h' : 'd'}>${esc(c ?? '—')}</t${i === 0 ? 'h' : 'd'}>`,
            )
            .join('')}</tr>`,
      )
      .join('');
    const comments =
      typeof p.comments === 'string' && p.comments.trim()
        ? `<p class="muted">${esc(p.comments)}</p>`
        : '';
    return `${comments}<table class="rx-table">${body}</table>`;
  }

  return `<pre class="rx-fallback">${esc(JSON.stringify(rx, null, 2))}</pre>`;
}

export type InvoicePdfCompanyInfo = {
  store_address?: string | null;
  full_address?: string | null;
  gstin?: string | null;
  cin?: string | null;
  email?: string | null;
  phone?: string | null;
} | null;

export type InvoicePdfPayload = {
  invoice: any;
  company_info: InvoicePdfCompanyInfo;
  /** order_item_id → hydrated prescription */
  prescriptionsByOrderItemId: Record<string, unknown>;
};

const INVOICE_PDF_STYLES = `
    * { box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #111; margin: 0; }
    h1,h2,h3 { margin: 0 0 8px; }
    .muted { color: #666; font-size: 10px; }
    .header { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 16px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
    .header .seq { font-size: 36px; font-weight: 700; text-align: right; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
    table.items th, table.items td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
    table.items th { background: #f5f5f5; text-align: left; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    .totals { width: 280px; margin-left: auto; margin-top: 12px; }
    .totals .row { display: flex; justify-content: space-between; padding: 3px 0; }
    .totals .grand { font-weight: 700; border-top: 1px solid #111; margin-top: 6px; padding-top: 6px; }
    .page-break { page-break-before: always; }
    .invoice-break { page-break-before: always; }
    .spec-block { border: 1px solid #ddd; padding: 12px; margin-bottom: 12px; border-radius: 4px; }
    .rx-table { border-collapse: collapse; width: 100%; max-width: 420px; }
    .rx-table th, .rx-table td { border: 1px solid #ccc; padding: 4px 6px; text-align: center; }
    .rx-img { max-width: 100%; max-height: 360px; object-fit: contain; border: 1px solid #eee; }
    .rx-fallback { font-size: 9px; background: #f8f8f8; padding: 8px; overflow: auto; }
    .badge { display: inline-block; border: 1px solid #999; padding: 2px 8px; border-radius: 999px; font-size: 10px; }
`;

/**
 * Invoice body fragment (tax page + specs page with internal page-break).
 */
export function buildInvoiceBodyHtml(payload: InvoicePdfPayload): string {
  const { invoice, company_info, prescriptionsByOrderItemId } = payload;
  const items = (invoice.invoice_items || []).filter(
    (it: { cancelled_at?: Date | null }) => !it.cancelled_at,
  );
  const gst = invoice.gst_summary || {};
  const seqPart = String(invoice.invoice_number || '').split('/')[2] || '';
  const issued = dayjs(invoice.issued_date || invoice.created_at).format(
    'DD/MM/YYYY',
  );
  const orderDate = dayjs(invoice.order?.created_at).format('DD/MM/YYYY');
  const qty = items.reduce(
    (s: number, it: { quantity?: number }) => s + Number(it.quantity || 0),
    0,
  );

  const lineRows = items
    .map((it: any, idx: number) => {
      const taxable =
        Number(it.subtotal || 0) - Number(it.discount_amount || 0);
      return `<tr>
        <td>${idx + 1}</td>
        <td>${esc(it.product_name)}${it.product_sku ? `<br/><span class="muted">${esc(it.product_sku)}</span>` : ''}</td>
        <td class="num">${esc(it.quantity)}</td>
        <td class="num">${esc(inr(it.unit_price))}</td>
        <td class="num">${esc(inr(taxable))}</td>
        <td class="num">${esc(inr(it.tax_amount))}</td>
        <td class="num">${esc(inr(it.total_amount))}</td>
      </tr>`;
    })
    .join('');

  const specsPages = items
    .map((it: any, idx: number) => {
      const lensTitles = [it.power_type, it.lens_detail, it.lens_feature]
        .map(titleOf)
        .filter(Boolean)
        .join(' · ');
      const lid = lensIdOf(it.lens_detail);
      const rx =
        it.order_item_id && prescriptionsByOrderItemId[it.order_item_id]
          ? prescriptionsByOrderItemId[it.order_item_id]
          : null;
      return `<section class="spec-block">
        <h3>Line ${idx + 1}: ${esc(it.product_name)}</h3>
        <p class="muted">${it.frame_only ? 'Frame only' : esc(lensTitles || 'Lens configuration')}</p>
        ${lid ? `<p><strong>Lens ID:</strong> ${esc(lid)}</p>` : ''}
        ${
          it.frame_only
            ? ''
            : `<div class="rx">${prescriptionHtml(rx)}</div>`
        }
      </section>`;
    })
    .join('');

  return `
  <div class="header">
    <div>
      <h1>Tax Invoice</h1>
      <p><strong>Invoice:</strong> ${esc(invoice.invoice_number)}</p>
      <p><strong>Order ID:</strong> ${esc(invoice.order?.id)}</p>
      <p><strong>Order date:</strong> ${esc(orderDate)}</p>
      <p><strong>Issued:</strong> ${esc(issued)}</p>
      <p><strong>Qty:</strong> ${esc(qty)} · <span class="badge">${esc(invoice.status)}</span></p>
    </div>
    <div>
      <div class="seq">${esc(seqPart)}</div>
      <p class="muted" style="text-align:right">Akku Ka Chasma</p>
    </div>
  </div>

  <div class="grid-2">
    <div>
      <h3>Bill From</h3>
      <p>${esc(company_info?.store_address || 'Akku Ka Chasma')}</p>
      <p>${esc(company_info?.full_address || '')}</p>
      <p><strong>GSTIN:</strong> ${esc(company_info?.gstin || '')}</p>
      ${company_info?.cin ? `<p><strong>CIN:</strong> ${esc(company_info.cin)}</p>` : ''}
    </div>
    <div>
      <h3>Address Of Delivery</h3>
      <p><strong>${esc(invoice.order?.user?.name || '')}</strong></p>
      <p>${esc(invoice.order?.address?.address || 'No address provided')}</p>
      <p>${esc(invoice.order?.address?.city || '')}, ${esc(invoice.order?.address?.state || '')}${
        invoice.order?.address?.zip_code
          ? ` (${esc(invoice.order.address.zip_code)})`
          : ''
      }</p>
      <p>${esc(invoice.order?.user?.phone_number || '')}</p>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th class="num">Qty</th>
        <th class="num">Unit</th>
        <th class="num">Taxable</th>
        <th class="num">Tax</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${esc(inr(invoice.subtotal))}</span></div>
    <div class="row"><span>Discount on MRP</span><span>− ${esc(inr(invoice.discount_on_mrp_total))}</span></div>
    <div class="row"><span>Coupon</span><span>− ${esc(inr(invoice.coupon_discount_total))}</span></div>
    <div class="row"><span>Shipping</span><span>${esc(inr(invoice.shipping_total))}</span></div>
    <div class="row"><span>CGST</span><span>${esc(inr(gst.cgst_total || 0))}</span></div>
    <div class="row"><span>SGST</span><span>${esc(inr(gst.sgst_total || 0))}</span></div>
    <div class="row"><span>IGST</span><span>${esc(inr(gst.igst_total || 0))}</span></div>
    <div class="row"><span>Other taxes</span><span>${esc(inr(gst.other_tax_total || 0))}</span></div>
    <div class="row grand"><span>Grand total</span><span>${esc(inr(invoice.grand_total))}</span></div>
  </div>

  <div class="page-break">
    <h2>Line specifications &amp; prescriptions</h2>
    <p class="muted">Invoice ${esc(invoice.invoice_number)}</p>
    ${specsPages || '<p class="muted">No active lines.</p>'}
  </div>`;
}

function wrapInvoiceDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${INVOICE_PDF_STYLES}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

/**
 * Self-contained tax invoice HTML for Puppeteer `page.setContent`.
 */
export function buildInvoiceHtml(payload: InvoicePdfPayload): string {
  return wrapInvoiceDocument(
    `Invoice ${payload.invoice.invoice_number}`,
    buildInvoiceBodyHtml(payload),
  );
}

/**
 * Multiple invoices in one HTML document. First invoice has no break;
 * subsequent invoices use `page-break-before: always`. Each invoice keeps
 * its internal specs page-break.
 */
export function buildBulkInvoiceHtml(payloads: InvoicePdfPayload[]): string {
  const sections = payloads
    .map((payload, index) => {
      const body = buildInvoiceBodyHtml(payload);
      const breakClass = index === 0 ? '' : ' invoice-break';
      return `<div class="invoice-doc${breakClass}">${body}</div>`;
    })
    .join('\n');

  return wrapInvoiceDocument('Invoices bulk PDF', sections);
}
