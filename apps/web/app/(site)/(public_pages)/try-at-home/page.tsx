import TryAtHomeForm from "@/features/tryathome/components/TryAtHomeForm";
import TryAtHomeHero from "@/features/tryathome/components/TryAtHomeHero";
import { Button } from "@/components/ui/button";
import { Headphones, Home } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Try at Home | Akku Ka Chasma",
  description:
    "Book a home visit to try premium eyeglasses and sunglasses with expert fitting—flexible timing, no obligation. Request try-at-home service from Akku Ka Chasma.",
  keywords: [
    "try at home eyewear",
    "home eye test India",
    "eyeglasses home trial",
    "Akku Ka Chasma try at home",
    "optical home visit",
    "eyewear consultation at home",
  ],
  openGraph: {
    title: "Try at Home | Akku Ka Chasma",
    description:
      "We bring curated frames to your doorstep—professional fitting, flexible slots, no pressure to buy.",
    url: "https://akkukachasma.com/try-at-home",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/try-at-home",
  },
};

export default function TryAtHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TryAtHomeHero />

      <section className="app-container px-4 py-14 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Request try at home
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Fill out the form and our team will contact you to schedule a
              convenient visit. We&apos;ll bring a curated selection of premium
              eyewear to your home.
            </p>

            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                What to expect
              </h3>
              <ul className="mt-4 space-y-5">
                <ExpectationItem
                  title="Professional consultation"
                  description="Guidance on frames, fit, and lens options in your own space."
                />
                <ExpectationItem
                  title="Curated selection"
                  description="Premium frames picked for your style and prescription needs."
                />
                <ExpectationItem
                  title="Expert fitting"
                  description="Adjustments and style advice from our trained team."
                />
                <ExpectationItem
                  title="No pressure"
                  description="Try everything at ease—purchase only when you are ready."
                />
              </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-6">
              <p className="text-sm font-medium text-foreground">
                Need help before booking?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reach our support team for eligibility, areas we serve, or
                general questions.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/support">Contact support</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/track-order">Track an order</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <TryAtHomeForm className="w-full max-w-none border-border/80 shadow-lg shadow-primary/5" />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="app-container px-4 py-12 text-center md:py-14">
          <Home className="mx-auto size-10 text-primary/80" aria-hidden />
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            After you submit, we&apos;ll call or message you to confirm your
            slot and any prescription or product preferences.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            For other questions,{" "}
            <Link
              href="/support"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              visit support
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function ExpectationItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Headphones className="size-4 text-primary" aria-hidden />
      </div>
      <div>
        <p className="font-semibold leading-snug">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  );
}
