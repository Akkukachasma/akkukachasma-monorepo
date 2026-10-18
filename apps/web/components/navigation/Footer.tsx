import Link from "next/link";
import Logo from "./Logo";
import { FooterCopyrightBar } from "./FooterCopyrightBar";
import { Truck, Clock, CreditCard } from "lucide-react";
import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import FooterNewsletterSubscribe from "./FooterNewsletterSubscribe";

const features = [
  { icon: Truck, label: "Free Shipping ( 5 - 7 days )" },
  { icon: Clock, label: "24×7 Support" },
  { icon: CreditCard, label: "Secure Payment" },
] as const;

const accountLinks = [
  { href: "/track-order", label: "Track Order" },
  { href: "/about-us", label: "About Us" },
  { href: "/support", label: "Help" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      {/* Feature strip */}
      <div className="border-b bg-muted/50">
        <div className="app-container py-4">
          <ul className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:justify-between md:gap-6">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b bg-muted/30 py-12 md:py-16">
        <div className="app-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Get updates on WhatsApp
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscribe with your mobile number for offers and updates. No spam.
            </p>
            <FooterNewsletterSubscribe />
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="app-container py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Brand + about */}
          <div className="lg:col-span-2">
            <Logo className="h-14 w-[200px] sm:h-16 sm:w-[240px]" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Order eyeglasses and sunglasses — round, square, geometric shapes
              — from a wide range of styles online. Shop branded frames and blue
              cut lenses. Available online and offline with Akku Ka Chasma.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick links
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {accountLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "text-sm text-muted-foreground transition-colors",
                      "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact us
            </h3>
            <address className="mt-4 not-italic">
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://maps.google.com/?q=1/A+Sector+Noida+India-201301"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>1/A Sector, Noida, India-201301</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+918188881661"
                    className="flex gap-3 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+91 8188881661</span>
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t py-6">
        <div className="app-container">
          <FooterCopyrightBar />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
