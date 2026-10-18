import { ContactForm } from "@/features/contact-us";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Book,
  Clock,
  Headphones,
  HelpCircle,
  Home,
  LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support & Contact | Akku Ka Chasma",
  description:
    "Get in touch with Akku Ka Chasma's customer support team. We're here to help with your eyewear needs, queries, and concerns. Available via phone, email, or visit our store in New Delhi.",
  keywords: [
    "customer support",
    "contact us",
    "akku ka chasma support",
    "eyewear help",
    "optical store contact",
    "eyewear customer service",
    "delhi optical store",
    "eyewear consultation",
  ],
  openGraph: {
    title: "Support & Contact | Akku Ka Chasma",
    description:
      "Get in touch with Akku Ka Chasma's customer support team. We're here to help with your eyewear needs, queries, and concerns. Available via phone, email, or visit our store in New Delhi.",
    url: "https://akkukachasma.com/support",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/support",
  },
};

/** Keep in sync with business; used for display and clickable links. */
const CONTACT = {
  phoneDisplay: "+91 8188881661",
  phoneTel: "+918188881661",
  email: "akkukachasma@gmail.com",
  addressLine: "1/A Sector 13",
  addressCity: "Noida, India - 201301",
  hoursTitle: "Monday - Saturday",
  hoursDetail: "11:00 AM - 6:00 PM",
  phoneHoursNote: "Mon-Sat 11am to 6pm",
} as const;

const QUICK_LINKS = [
  {
    href: "/try-at-home",
    label: "Try at home",
    description: "Book a home visit",
    icon: Home,
  },
  {
    href: "/blog/size-guide",
    label: "Size Guide",
    description: "Find the perfect frame size for your face",
    icon: Book,
  },
  {
    href: "/blog/return-policy",
    label: "Return Policy",
    description: "Learn how to return your order",
    icon: Package,
  },
  {
    href: "/blog/delivery-time",
    label: "Delivery Time",
    description: "Learn about our delivery time",
    icon: Truck,
  },
  {
    href: "/blog/how-to-buy",
    label: "How to buy",
    description: "Learn how to buy from us",
    icon: ShoppingCart,
  },
  {
    href: "/track-order",
    label: "Track order",
    description: "Check your shipment",
    icon: HelpCircle,
  },
  {
    href: "/franchise-enquiry",
    label: "Franchise",
    description: "Partner with us",
    icon: MessageCircle,
  },
] as const;

const FORM_TITLE = "Get in Touch";
const FORM_DESCRIPTION =
  "Have a question about our products or services? Fill out the form and we'll get back to you shortly.";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-25%,hsl(var(--primary)/0.16),transparent)]"
          aria-hidden
        />
        <div className="app-container relative px-4 py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary sm:text-sm">
              <Headphones className="size-4 shrink-0" aria-hidden />
              We&apos;re here to help
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How can we{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Orders, prescriptions, returns, or product advice—reach us by phone,
              email, or the form below. Our team will get back as soon as we can.
            </p>
          </div>

          {/* Quick links */}
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

      {/* Contact channels */}
      <section className="border-b border-border/60 bg-muted/25">
        <div className="app-container px-4 py-12 md:py-16">
          <h2 className="sr-only">Contact options</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <ContactChannel
              icon={Phone}
              title="Phone support"
              primary={
                <a
                  href={`tel:${CONTACT.phoneTel}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {CONTACT.phoneDisplay}
                </a>
              }
              secondary={CONTACT.phoneHoursNote}
            />
            <ContactChannel
              icon={Mail}
              title="Email"
              primary={
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {CONTACT.email}
                </a>
              }
              secondary="We read every message"
            />
            <ContactChannel
              icon={MapPin}
              title="Visit us"
              primary={
                <span className="font-medium text-foreground">
                  {CONTACT.addressLine}
                </span>
              }
              secondary={CONTACT.addressCity}
            />
            <ContactChannel
              icon={Clock}
              title="Business hours"
              primary={
                <span className="font-medium text-foreground">
                  {CONTACT.hoursTitle}
                </span>
              }
              secondary={CONTACT.hoursDetail}
            />
          </div>
        </div>
      </section>

      {/* Form + expectations */}
      <section className="app-container px-4 py-14 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Before you write
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Include your order ID, product name, or prescription details when
              relevant so we can help in one go. For general questions, a short
              summary is enough.
            </p>

            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                What to expect
              </h3>
              <ul className="mt-4 space-y-5">
                <ExpectationItem
                  title="Quick response"
                  description="We aim to respond within 24 hours on business days."
                />
                <ExpectationItem
                  title="Expert support"
                  description="Get help from our team on frames, lenses, and orders."
                />
                <ExpectationItem
                  title="Clear answers"
                  description="We focus on practical solutions you can act on."
                />
              </ul>
            </div>

            <div className="mt-10 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-6">
              <p className="text-sm font-medium text-foreground">
                Prefer browsing first?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore eyewear collections or read tips on our blog.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/categories/eyeglasses">Shop eyeglasses</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/blog">Blog</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="overflow-hidden border-border/80 shadow-lg shadow-primary/5">
              <CardHeader className="space-y-1 border-b border-border/60 bg-muted/30 pb-6">
                <CardTitle className="text-xl sm:text-2xl">
                  Send us a message
                </CardTitle>
                <CardDescription className="text-base">
                  All fields marked required must be filled. Your inquiry is
                  sent securely to our support queue.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                {/*
                  ContactForm owns title/description UI internally; keep props identical
                  to preserve inquiry source and copy for the API / UX.
                */}
                <ContactForm
                  title={FORM_TITLE}
                  description={FORM_DESCRIPTION}
                  source="contact_us"
                  className="max-w-none [&_h2]:text-xl [&_p.text-muted-foreground]:text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom reassurance */}
      <section className="border-t border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="app-container px-4 py-12 text-center md:py-14">
          <Headphones className="mx-auto size-10 text-primary/80" aria-hidden />
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            For urgent order issues, mention your order ID in the message so we
            can help faster.
          </p>
        </div>
      </section>
    </div>
  );
}

function ContactChannel({
  icon: Icon,
  title,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  title: string;
  primary: ReactNode;
  secondary: string;
}) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <div className="mt-2 block text-sm sm:text-base">{primary}</div>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {secondary}
        </p>
      </div>
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
