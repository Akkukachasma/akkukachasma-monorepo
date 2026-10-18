import { LoginForm } from "@/components/auth/LoginForm";
import AuthHeader from "@/components/navigation/AuthHeader";
import Footer from "@/components/navigation/Footer";
import Logo from "@/components/navigation/Logo";
import { isMobileDevice } from "@/lib/server";
import {
  Shield,
  TagIcon,
  Truck,
  HeartHandshake,
  LucideIcon,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";
export const metadata: Metadata = {
  title: "Login - Akku Ka Chasma | Wholesale Eyewear Dashboard",
  description:
    "Access your Akku Ka Chasma business dashboard. Track orders, manage inventory, and access wholesale prices for eyewear products. Secure login for optical retailers.",
  keywords: [
    "optical business login",
    "eyewear wholesale dashboard",
    "optical retailer portal",
    "business account login",
    "wholesale eyewear access",
    "optical supplier login",
    "akku ka chasma login",
    "eyewear business portal",
    "optical inventory management",
    "wholesale pricing access",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Login to Your Akku Ka Chasma Business Account",
    description:
      "Access your wholesale eyewear dashboard. Manage orders, track inventory, and get exclusive wholesale prices.",
    url: "https://akkukachasma.com/login",
    siteName: "Akku Ka Chasma",
    type: "website",
    // images: [
    //   {
    //     url: "https://akkukachasma.com/images/business-login.jpg", // Add your actual image
    //     width: 1200,
    //     height: 630,
    //     alt: "Akku Ka Chasma Business Login",
    //   },
    // ],
  },
  alternates: {
    canonical: "https://akkukachasma.com/login",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Akku Ka Chasma",
    "apple-mobile-web-app-title": "Akku Ka Chasma",
  },
  verification: {
    google: "your-verification-code", // Add if you have one
  },
};
export default async function LoginPage() {


  const isMobile = await isMobileDevice();

  if (isMobile) {
    return (
      <div className="bg-primary h-screen w-screen flex flex-col">
        <div className="bg-transparent text-primary-foreground h-1/5 flex-shrink-0 px-4 ">
          <div className="flex items-center justify-between h-[60px]">
            <Link href="/" aria-label="Back to home">
              <ChevronLeft className="size-6" />
            </Link>
            <Logo imageClassName="invert" />
          </div>
        </div>
        <div className="bg-primary-foreground flex-grow rounded-t-[40px] overflow-hidden">
          <LoginForm />
        </div>
      </div>
    )
  }



  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-background to-secondary pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Navigation */}
      <AuthHeader>
        <Link
          href="/signup"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Don't have an account?
        </Link>
      </AuthHeader>

      <main className="app-container mx-auto w-full flex-1 px-4 py-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Content */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
                Welcome Back to Akku Ka Chasma
              </h1>
              <p className="text-lg text-muted-foreground">
                Access your wholesale eyewear dashboard and manage your business
                efficiently.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <BenefitCard
                icon={Shield}
                title="Secure Access"
                description="Your business data is protected with enterprise-grade security"
              />
              <BenefitCard
                icon={Truck}
                title="Order Tracking"
                description="Track all your shipments and inventory in real-time"
              />
              <BenefitCard
                icon={HeartHandshake}
                title="Dedicated Support"
                description="24/7 support for all your business needs"
              />
              <BenefitCard
                icon={TagIcon}
                title="Special Prices"
                description="Access wholesale prices and bulk discounts"
              />
            </div>

            {/* Trust Banner */}
            <div className="mt-12 p-6 bg-accent/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium mb-4">
                  Trusted by Leading Retailers Across India
                </p>
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">2000+</div>
                    <div className="text-sm text-muted-foreground">
                      Active Retailers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8/5</div>
                    <div className="text-sm text-muted-foreground">
                      Customer Rating
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="lg:pl-8">
            <React.Suspense
              fallback={
                <div className="flex min-h-[280px] w-full max-w-lg mx-auto items-center justify-center rounded-lg border bg-card p-8 text-sm text-muted-foreground">
                  Loading sign-in…
                </div>
              }
            >
              <LoginForm />
            </React.Suspense>
            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-center items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <span className="font-medium">100% Secure</span> Payment
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <span className="font-medium">Free Shipping</span> Above
                    ₹999
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Benefit Card Component
interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="group rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent">
      <Icon className="h-8 w-8 text-primary mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
