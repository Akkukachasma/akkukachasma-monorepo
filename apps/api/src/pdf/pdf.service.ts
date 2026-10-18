import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import {
  getPuppeteerLaunchOptions,
  resolveChromeExecutable,
} from './pdf-browser.util';

export type HtmlToPdfOptions = {
  /** Paper format when `widthPx` is not set. */
  format?: 'A4' | 'A5' | 'Letter';
  /** Fixed content/page width in CSS pixels (e.g. 1150 for full-width digital PDF). */
  widthPx?: number;
  /** Optional fixed height; when omitted with `widthPx`, height follows content. */
  heightPx?: number;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
};

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly config: ConfigService) {}

  async htmlToPdf(
    html: string,
    options: HtmlToPdfOptions = {},
  ): Promise<Buffer> {
    let executablePath: string;
    try {
      executablePath = resolveChromeExecutable(
        this.config.get<string>('PUPPETEER_EXECUTABLE_PATH'),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Chrome is not available';
      this.logger.error(message);
      throw new InternalServerErrorException(message);
    }

    const browser = await puppeteer.launch(
      getPuppeteerLaunchOptions(executablePath),
    );

    try {
      const page = await browser.newPage();
      const widthPx = options.widthPx;

      if (widthPx && widthPx > 0) {
        await page.setViewport({
          width: Math.round(widthPx),
          height: 800,
          deviceScaleFactor: 1,
        });
      }

      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 60_000,
      });
      await page.emulateMediaType('screen');
      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map(
            (img) =>
              img.complete ||
              new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              }),
          ),
        );
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      });

      const zeroMargin = {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      };
      const margin = options.margin ?? zeroMargin;

      if (widthPx && widthPx > 0) {
        const contentHeight = await page.evaluate(() => {
          const el = document.documentElement;
          const body = document.body;
          return Math.ceil(
            Math.max(
              body?.scrollHeight ?? 0,
              body?.offsetHeight ?? 0,
              el?.scrollHeight ?? 0,
              el?.offsetHeight ?? 0,
            ),
          );
        });
        const heightPx = Math.max(
          options.heightPx ?? 0,
          contentHeight || 1,
          1,
        );

        const pdf = await page.pdf({
          width: `${Math.round(widthPx)}px`,
          height: `${heightPx}px`,
          printBackground: options.printBackground ?? true,
          margin,
          pageRanges: '1',
        });
        return Buffer.from(pdf);
      }

      const pdf = await page.pdf({
        format: options.format ?? 'A4',
        printBackground: options.printBackground ?? true,
        margin,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close().catch(() => undefined);
    }
  }
}
