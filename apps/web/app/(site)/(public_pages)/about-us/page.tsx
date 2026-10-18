import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Glasses,
  HeartHandshake,
  MapPin,
  Package,
  Sparkles,
  Store,
  Truck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Akku Ka Chasma",
  description:
    "Akku Ka Chasma is an Indian eyewear brand rooted in Delhi—serving customers online and offline since 2009 in retail and 2013 on the web. Discover our story, values, and commitment to quality eyeglasses, sunglasses, and contact lenses at fair prices.",
  keywords: [
    "Akku Ka Chasma",
    "about Akku Ka Chasma",
    "Indian eyewear brand",
    "optical store Delhi",
    "buy eyeglasses online India",
    "sunglasses online",
    "optical franchise India",
  ],
  openGraph: {
    title: "About Us | Akku Ka Chasma",
    description:
      "Our journey from offline optical retail to a trusted online destination for eyewear across India.",
    url: "https://akkukachasma.com/about-us",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  alternates: {
    canonical: "https://akkukachasma.com/about-us",
  },
};

const milestones = [
  {
    year: "2009",
    title: "Where it began",
    body: "We started in offline optical retail—building relationships with customers and understanding what Indian shoppers really need from their eyewear.",
  },
  {
    year: "2013",
    title: "Online, nationwide",
    body: "We brought the same care and range to the web so you could shop eyeglasses, sunglasses, and lenses from anywhere in India—with clear information and dependable service.",
  },
  {
    year: "Today",
    title: "Growing together",
    body: "We continue to expand our catalogue, improve delivery and support, and partner with entrepreneurs through our franchise program—always focused on value, not hype.",
  },
] as const;

const values = [
  {
    icon: HeartHandshake,
    title: "Customer first",
    text: "Fair pricing, honest product detail, and support when you need it—whether you shop online or visit a partner store.",
  },
  {
    icon: Package,
    title: "Quality & choice",
    text: "A wide mix of frames and lenses—from everyday specs to sunglasses and contact lenses—curated for real life, not just trends.",
  },
  {
    icon: Truck,
    title: "Pan-India reach",
    text: "Reliable shipping across the country so your order reaches you safely and on time.",
  },
  {
    icon: Sparkles,
    title: "Value over logos",
    text: "We focus on well-made eyewear at sensible prices rather than pushing a single luxury brand story.",
  },
] as const;

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-30%,hsl(var(--primary)/0.18),transparent)]"
          aria-hidden
        />
        <div className="app-container relative px-4 py-16 sm:py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
              <Glasses className="size-4" aria-hidden />
              Indian eyewear, built for you
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Akku Ka Chasma
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl">
              From our roots in Delhi to customers across India—we combine
              offline optical experience with a modern online store so you can
              see clearly, look good, and shop with confidence.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/eyeglasses">
                  Shop eyeglasses
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/support">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="border-b border-border/60 bg-muted/30">
        <div className="app-container grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:py-14">
          <Stat label="Offline retail" value="Since 2009" />
          <Stat label="Online store" value="Since 2013" />
          <Stat label="Product range" value="1500+ styles" />
          <Stat label="Based in" value="New Delhi" />
        </div>
      </section>

      {/* Story / timeline */}
      <section className="app-container px-4 py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center md:max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Our story
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            A short journey from local optical care to a brand that serves
            shoppers and franchise partners across India.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl">
          <ol className="relative space-y-0 border-s border-primary/25 ps-6 md:ps-10">
            {milestones.map((m) => (
              <li
                key={m.year}
                className="relative pb-12 last:pb-0 md:pb-16 md:last:pb-0"
              >
                <span
                  className="absolute -start-[calc(0.5rem+1px)] mt-1.5 flex size-3 rounded-full border-2 border-background bg-primary md:-start-[calc(1.25rem+1px)] md:size-3.5"
                  aria-hidden
                />
                <div className="ms-2 md:ms-4">
                  <span className="text-sm font-semibold text-primary">
                    {m.year}
                  </span>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-2 max-w-prose text-muted-foreground leading-relaxed">
                    {m.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border/60 bg-gradient-to-b from-muted/40 to-background py-14 md:py-20">
        <div className="app-container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              What we stand for
            </h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              Principles that guide how we source, sell, and support every
              order.
            </p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:gap-8">
            {values.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="group flex gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Offerings + location */}
      <section className="app-container px-4 py-14 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What you&apos;ll find with us
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you need prescription eyeglasses, sunglasses, computer
              lenses, progressives, or contact lenses—we work to offer a broad
              selection at prices that make sense for Indian families. Our team
              keeps an eye on quality and fit so you can choose with clarity.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground sm:text-base">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Prescription eyeglasses and lens options for work, study, and
                daily wear
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Sunglasses and UV-conscious choices for outdoors
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Contact lenses—including colour options where available
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Ongoing offers and transparent discounts on many catalogue
                lines
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Headquartered in Delhi</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Our operations are centred in New Delhi, with nationwide
                  delivery and a growing network of franchise partners who share
                  our standards for service and product range.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
              <Button variant="secondary" className="gap-2" asChild>
                <Link href="/franchise-enquiry">
                  <Store className="size-4" />
                  Franchise enquiry
                </Link>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/blog">
                  Read our blog
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="app-container flex flex-col items-center gap-6 px-4 py-14 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <div className="mb-3 flex justify-center md:justify-start">
              <Users className="size-10 opacity-90" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to find your next pair?
            </h2>
            <p className="mt-2 text-sm opacity-90 sm:text-base">
              Browse the store, ask us anything on the support page, or explore
              franchise opportunities if you want to grow with us.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-shrink-0">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-foreground"
              asChild
            >
              <Link href="/categories/eyeglasses">
                Start shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/support">Get support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
        {label}
      </p>
    </div>
  );
}
