"use client";

import Link from "next/link";
import { ThemeModeSelect } from "@/components/theme";

export function FooterCopyrightBar() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground md:flex-row md:text-left">
      <p>© 2013 - {new Date().getFullYear()} Akku Ka Chasma. All rights reserved.</p>
      <p className="text-sm font-semibold text-foreground md:text-base">
        {new Date().getFullYear() - 2013} Years of Eyewear Excellence
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center md:justify-end">
        <nav aria-label="Legal and support links">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <li>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <ThemeModeSelect id="footer-theme-select" />
      </div>
    </div>
  );
}
