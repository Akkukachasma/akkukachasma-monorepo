import { existsSync, mkdirSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import type { LaunchOptions } from 'puppeteer';

const SYSTEM_CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

const CHROME_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-crash-reporter',
  '--disable-breakpad',
  '--no-first-run',
  '--no-default-browser-check',
  '--no-zygote',
  '--font-render-hinting=none',
];

/**
 * Resolution order: Puppeteer-managed Chrome → PUPPETEER_EXECUTABLE_PATH → system paths.
 */
export function resolveChromeExecutable(configuredPath?: string): string {
  try {
    const bundled = puppeteer.executablePath();
    if (bundled && existsSync(bundled)) {
      return bundled;
    }
  } catch {
    /* bundled Chrome not installed */
  }

  const fromEnv = configuredPath?.trim();
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }

  for (const candidate of SYSTEM_CHROME_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Chrome is not available for PDF generation. Run `bun run puppeteer:install` in backend/, or set PUPPETEER_EXECUTABLE_PATH.',
  );
}

function chromiumHomeDir(): string {
  return (
    process.env.XDG_CONFIG_HOME?.trim() ||
    join(tmpdir(), '.akkukachasma-chromium')
  );
}

function chromiumCacheBase(): string {
  return (
    process.env.XDG_CACHE_HOME?.trim() ||
    join(tmpdir(), '.akkukachasma-chromium')
  );
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

export function getPuppeteerLaunchOptions(
  executablePath: string,
): LaunchOptions {
  const homeDir = chromiumHomeDir();
  ensureDir(homeDir);
  const cacheBase = chromiumCacheBase();
  ensureDir(cacheBase);
  const userDataDir = mkdtempSync(join(cacheBase, 'profile-'));

  return {
    headless: true,
    executablePath,
    userDataDir,
    env: {
      ...process.env,
      HOME: homeDir,
      DBUS_SESSION_BUS_ADDRESS:
        process.env.DBUS_SESSION_BUS_ADDRESS || '/dev/null',
    },
    args: CHROME_LAUNCH_ARGS,
  };
}
