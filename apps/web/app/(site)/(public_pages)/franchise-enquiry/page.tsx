import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FranchiseRequestForm } from "@/features/franchise-request";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Glasses,
  Headphones,
  Home,
  IndianRupee,
  Percent,
  Sparkles,
  Store,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Franchise Enquiry | Akku Ka Chasma",
  description:
    "Partner with Akku Ka Chasma for an eyeglass optical franchise in India—low investment (roughly 7–10 lakh INR), no franchise fee, training and stock support. Apply for a franchise enquiry online.",
  keywords: [
    "optical franchise India",
    "eyeglass franchise",
    "Akku Ka Chasma franchise",
    "optical shop franchise",
    "eyewear business India",
    "low investment franchise",
  ],
  openGraph: {
    title: "Franchise Enquiry | Akku Ka Chasma",
    description:
      "Start your optical retail business with established online and offline support—competitive investment, no franchise fee, and a share of net sales.",
    url: "https://akkukachasma.com/franchise-enquiry",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/franchise-enquiry",
  },
};

const QUICK_LINKS = [
  {
    href: "/support",
    label: "Support",
    description: "Talk to our team",
    icon: Headphones,
  },
  {
    href: "/try-at-home",
    label: "Try at home",
    description: "Book a home visit",
    icon: Home,
  },
  {
    href: "/about-us",
    label: "About us",
    description: "Our story & values",
    icon: Glasses,
  },
] as const;

const HIGHLIGHTS = [
  {
    icon: IndianRupee,
    title: "Roughly 7–10 lakh INR",
    description: "Typical range to start your optical business with us.",
  },
  {
    icon: Sparkles,
    title: "No franchise fee",
    description: "We focus capital on stock, fit-out, and running the store.",
  },
  {
    icon: Percent,
    title: "35% of net sales",
    description: "Franchise owners take 35% of net sales.",
  },
] as const;

export default function FranchiseEnquiryPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-25%,hsl(var(--primary)/0.16),transparent)]"
          aria-hidden
        />
        <div className="app-container relative px-4 py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
              <Store className="size-4 shrink-0" aria-hidden />
              Franchise opportunity
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Eyeglass optical franchise —{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                a strong long-term investment
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              We help you start your optical business for roughly{" "}
              <span className="font-medium text-foreground">7–10 lakh</span>{" "}
              INR. Eyeglass optical franchise is built for long-term returns.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-border/80 bg-card/80 px-4 py-3 text-left shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="border-b border-border/60 bg-muted/25">
        <div className="app-container px-4 py-12 md:py-16">
          <h2 className="sr-only">Investment highlights</h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-snug sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + form */}
      <section className="app-container px-4 py-14 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Hi — we help you start your optical business for roughly{" "}
                <span className="font-medium text-foreground">7–10 lakh</span>{" "}
                INR. Eyeglass optical franchise is built for long-term returns.
              </p>
            </div>

            <ContentBlock title="Why choose Akkukachasma.com">
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground sm:pl-6">
                <li>
                  Established name in online and offline optical retail since
                  2013.
                </li>
                <li>
                  Low investment with a high-return business proposition.
                </li>
                <li>A wide range of premium eyewear and designs.</li>
                <li>Franchise owners take 35% of net sales.</li>
              </ul>
            </ContentBlock>

            <p className="text-justify text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              From offline work since 2009 and online since 2013,
              Akkukachasma.com is active across India for optical shop
              franchises with full support. We welcome entrepreneurs and
              investors in retail, doctor chains, and marketing. We sell through
              both online and offline channels. We focus on quality frames at
              fair prices rather than pushing a single brand logo.
            </p>

            <ContentBlock title="About Akkukachasma.com">
              <p className="mt-3 text-justify text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                We offer eyeglasses, computer lenses, progressive lenses, UV400
                sunglasses, contact lenses, colour contacts, and prescription
                lenses. Eyecare products are backed by a wide network of
                satisfied eye doctors. Our team tracks local and online prices
                on 1,500+ selected items so you get competitive pricing.
              </p>
            </ContentBlock>

            <ContentBlock title="Our support & benefits">
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground sm:pl-6">
                <li>Stock and maintenance support.</li>
                <li>All-India delivery in about 5–6 days.</li>
                <li>Mixed-brand assortment and service.</li>
                <li>Shop furnishing support.</li>
                <li>Training.</li>
              </ul>
            </ContentBlock>

            <ContentBlock title="Requirements & investment">
              <p className="mt-3 text-justify text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Space: about 100–500 square feet.
                <br />
                For: educated individuals, businessmen, or entrepreneurs.
                <br />
                Investment: up to roughly 7–10 lakh INR.{" "}
                <span className="font-medium text-foreground">
                  No franchise fee.
                </span>
              </p>
            </ContentBlock>

            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-6">
              <p className="text-sm font-medium text-foreground">
                Questions before you apply?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Our support team can help with eligibility and next steps.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/support">Contact support</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/about-us">About Akku Ka Chasma</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Card className="overflow-hidden border-border/80 shadow-lg shadow-primary/5">
              <CardHeader className="space-y-1 border-b border-border/60 bg-muted/30 pb-6">
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-xl sm:text-2xl">
                  Apply for a franchise
                </CardTitle>
                <CardDescription className="text-base">
                  Share your details below. We will contact you after we review
                  your enquiry.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <FranchiseRequestForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="app-container px-4 py-12 text-center md:py-14">
          <Store className="mx-auto size-10 text-primary/80" aria-hidden />
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            Submitted enquiries are reviewed in order. Include accurate contact
            details so we can reach you quickly.
          </p>
        </div>
      </section>
    </main>
  );
}

function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
