import type { RefObject } from "react";

export type PrintDomNodesOptions = {
  /** Extra CSS injected into the print iframe (e.g. page breaks). */
  extraCss?: string;
};

function waitForStylesAndFonts(doc: Document): Promise<void> {
  const links = [
    ...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ];
  const linkDone = links.map(
    (link) =>
      new Promise<void>((resolve) => {
        if (link.sheet) {
          resolve();
          return;
        }
        const done = () => resolve();
        link.addEventListener("load", done, { once: true });
        link.addEventListener("error", done, { once: true });
      }),
  );
  return Promise.all([...linkDone, doc.fonts.ready]).then(() => undefined);
}

/**
 * Opens the browser print dialog for a **deep clone** of the given nodes inside a
 * hidden iframe. Only that content is printed (not the rest of the app shell).
 *
 * - Copies `link[rel="stylesheet"]` and inline `style` tags from `document.head`
 *   so Tailwind / component styles apply in the iframe.
 * - Sets `<base href>` from `document.baseURI` so relative URLs resolve like the host page.
 * - Injects a small print stylesheet (margins, `print-color-adjust`).
 */
export async function printDomNodes(
  nodes: HTMLElement[],
  options?: PrintDomNodesOptions,
): Promise<void> {
  const list = nodes.filter(Boolean);
  if (typeof window === "undefined" || list.length === 0) return;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print preview");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  const stylesheetLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  )
    .map((l) => l.cloneNode(true) as HTMLLinkElement)
    .map((l) => l.outerHTML)
    .join("");

  const inlineHeadStyles = Array.from(document.head.querySelectorAll("style"))
    .map((s) => s.outerHTML)
    .join("");

  const defaultExtra = `
    @page { margin: 12mm; }
    body { margin: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-dom-nodes__page-break { break-after: page; page-break-after: always; height: 0; margin: 0; }
  `;

  doc.open();
  doc.write("<!DOCTYPE html><html><head><meta charset=\"utf-8\"/>");
  doc.write(`<base href="${document.baseURI}" />`);
  doc.write(stylesheetLinks);
  doc.write(inlineHeadStyles);
  doc.write(
    `<style>${defaultExtra}${options?.extraCss ?? ""}</style></head><body><div id="print-dom-nodes-root"></div></body></html>`,
  );
  doc.close();

  const root = doc.getElementById("print-dom-nodes-root");
  if (!root) {
    iframe.remove();
    return;
  }

  list.forEach((node, index) => {
    root.appendChild(node.cloneNode(true));
    if (index < list.length - 1) {
      const br = doc.createElement("div");
      br.className = "print-dom-nodes__page-break";
      br.setAttribute("aria-hidden", "true");
      root.appendChild(br);
    }
  });

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    win.removeEventListener("afterprint", onAfterPrint);
    iframe.remove();
  };

  const onAfterPrint = () => {
    cleanup();
  };

  await waitForStylesAndFonts(doc);
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  win.addEventListener("afterprint", onAfterPrint, { once: true });
  win.focus();
  win.print();

  // `afterprint` is missing in some browsers; avoid leaving the iframe forever.
  setTimeout(cleanup, 60_000);
}

/** Print a single element referred to by a React ref (current node only). */
export function printElementRef(
  ref: RefObject<HTMLElement | null>,
  options?: PrintDomNodesOptions,
): Promise<void> {
  const el = ref.current;
  if (!el) return Promise.resolve();
  return printDomNodes([el], options);
}

/**
 * Print multiple elements in order (e.g. invoice page 1 + page 2).
 * Inserts a forced page break between each ref’s element when printing.
 */
export function printElementRefs(
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  options?: PrintDomNodesOptions,
): Promise<void> {
  const nodes = refs
    .map((r) => r.current)
    .filter((n): n is HTMLElement => n instanceof HTMLElement);
  return printDomNodes(nodes, options);
}
