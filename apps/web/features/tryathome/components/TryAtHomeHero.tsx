import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Glasses,
  Headphones,
  Home,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import Link from "next/link";

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Truck,
    title: "Free home delivery",
    description: "We bring a curated selection of frames to your doorstep.",
  },
  {
    icon: Clock,
    title: "Flexible timing",
    description: "Pick a slot that works for you—we’ll confirm before we visit.",
  },
  {
    icon: Shield,
    title: "Safe & professional",
    description: "Trained team, clear process, and respect for your space.",
  },
  {
    icon: CheckCircle,
    title: "No obligation",
    description: "Try before you buy—no pressure to purchase on the spot.",
  },
];

const QUICK_LINKS = [
  {
    href: "/support",
    label: "Support",
    description: "Questions before you book",
    icon: Headphones,
  },
  {
    href: "/track-order",
    label: "Track order",
    description: "Check your shipment",
    icon: Package,
  },
  {
    href: "/categories/eyeglasses",
    label: "Shop",
    description: "Browse eyewear",
    icon: Glasses,
  },
] as const;

const STEPS = [
  {
    step: 1,
    title: "Request service",
    body: "Fill out the form with your details and preferences—we’ll reach out to schedule.",
  },
  {
    step: 2,
    title: "We visit you",
    body: "Our team arrives with a curated set of frames and lenses to try at home.",
  },
  {
    step: 3,
    title: "Try & choose",
    body: "Compare fits and styles with expert guidance, then decide in your own time.",
  },
] as const;

const TryAtHomeHero: React.FC = () => {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-25%,hsl(var(--primary)/0.16),transparent)]"
          aria-hidden
        />
        <div className="app-container relative px-4 py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
              <Home className="size-4 shrink-0" aria-hidden />
              Premium at-home service
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Try eyewear at{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                your home
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Experience premium frames and expert fitting without leaving your
              home. We bring the collection to you—relaxed, convenient, and
              tailored to your schedule.
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

      <section className="border-b border-border/60 bg-muted/25">
        <div className="app-container px-4 py-12 md:py-16">
          <h2 className="sr-only">Why try at home</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
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

      <section className="border-b border-border/60">
        <div className="app-container px-4 py-12 md:py-16">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card/50 p-8 shadow-sm md:p-10">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
              Three simple steps from request to trying frames in your living
              room.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {STEPS.map(({ step, title, body }) => (
                <div key={step} className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {step}
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TryAtHomeHero;
