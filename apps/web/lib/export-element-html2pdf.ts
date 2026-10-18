/**
 * Client-side PDF export using **html2pdf.js** (html2canvas + jsPDF).
 * Page size, margins, and canvas scale map to jsPDF / html2canvas options.
 */

export type Html2PdfPageFormat = "a4" | "a5" | "letter";

/** Page size in mm `[width, height]` for jsPDF (avoids string format edge cases). */
const PAGE_SIZE_MM: Record<Html2PdfPageFormat, [number, number]> = {
  a5: [148, 210],
  a4: [210, 297],
  letter: [215.9, 279.4],
};

export interface ExportElementHtml2PdfOptions {
  filename: string;
  pageFormat: Html2PdfPageFormat;
  /** Margin on all sides, in mm (jsPDF unit). */
  marginMm: number;
  /**
   * html2canvas `scale` — higher values look sharper and behave like a higher
   * capture zoom (larger canvas / file size).
   */
  canvasScale: number;
}

type Html2PdfWorker = {
  set: (opts: Record<string, unknown>) => {
    from: (el: HTMLElement) => { save: () => Promise<void> };
  };
};

export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportElementHtml2PdfOptions,
): Promise<void> {
  const mod = await import("html2pdf.js");
  const html2pdf = mod.default as unknown as () => Html2PdfWorker;

  const { filename, pageFormat, marginMm, canvasScale } = options;

  const worker = html2pdf().set({
    margin: marginMm,
    filename,
    image: { type: "jpeg", quality: 0.95 },
    html2canvas: {
      scale: canvasScale,
      useCORS: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm",
      format: PAGE_SIZE_MM[pageFormat],
      orientation: "portrait",
    },
    pagebreak: { mode: ["css", "legacy"] },
  });

  await worker.from(element).save();
}
