export type SerializeInvoiceDomOptions = {
  /** Reuse CSS collected once across bulk serializations. */
  css?: string;
};

/**
 * Serialize the on-screen invoice DOM into a standalone HTML document for
 * Puppeteer, preserving the admin invoice layout (Tailwind classes + page CSS).
 */
export function serializeInvoiceDomForPdf(
  root: HTMLElement,
  options?: SerializeInvoiceDomOptions,
): string {
  const clone = root.cloneNode(true) as HTMLElement;

  // Drop screen-only controls (Cancel line, Actions column, etc.)
  clone
    .querySelectorAll(".print\\:hidden, .invoice-pdf-export-hide")
    .forEach((el) => el.remove());

  // Reveal print-only banners (e.g. Tax invoice header)
  clone.querySelectorAll(".invoice-pdf-export-show").forEach((el) => {
    el.classList.remove("hidden");
    (el as HTMLElement).style.display = "block";
  });

  const css = options?.css ?? collectDocumentCss();
  const bodyHtml = clone.outerHTML;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <base href="${escapeAttr(window.location.origin)}/" />
  <style>
    /* A5 sheet (148mm ≈ 559px @ 96dpi) — match on-screen invoice */
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      width: 148mm;
      max-width: 148mm;
      min-width: 148mm;
    }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice-a5-sheet { max-width: 148mm !important; width: 100% !important; }
    ${css}
    /* Force print visibility helpers when not in @media print */
    .invoice-pdf-export-show { display: block !important; }
    .print\\:hidden, .invoice-pdf-export-hide { display: none !important; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

/** Collect readable document CSS once (for bulk PDF HTML payloads). */
export function collectInvoiceDocumentCss(): string {
  return collectDocumentCss();
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function collectDocumentCss(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        parts.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheets are not readable; skip.
    }
  }
  return parts.join("\n");
}
