import FeatureCard from "@/components/auth/FeatureCard";
import { SignupForm } from "@/components/auth/SignupForm";
import StatCard from "@/components/auth/StatCard";
import AuthHeader from "@/components/navigation/AuthHeader";
import Footer from "@/components/navigation/Footer";
import Logo from "@/components/navigation/Logo";
import { IconBadge } from "@/components/ui/icon-badge";
import { isMobileDevice } from "@/lib/server";
import {
  Award,
  Building2,
  ChevronLeft,
  Glasses,
  Handshake,
  Package,
  Star,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Sign Up - Akku Ka Chasma | Wholesale Eyewear Marketplace",
  description: "Create your business account on Akku Ka Chasma - India's leading wholesale marketplace for frames, lenses, and complete eyewear solutions. Access bulk orders, connect with suppliers, and grow your optical business.",
  keywords: [
    "wholesale eyewear",
    "business registration",
    "optical business",
    "eyewear marketplace",
    "wholesale frames",
    "optical supplier",
    "bulk eyewear orders",
    "optical business account",
    "eyewear wholesale india",
    "optical retail supplier",
  ],
  openGraph: {
    title: "Join Akku Ka Chasma - India's Leading Wholesale Eyewear Marketplace",
    description: "Create your business account and access wholesale prices, bulk orders, and a wide selection of eyewear products. Connect with top manufacturers and suppliers across India.",
    url: "https://akkukachasma.com/signup",
    siteName: "Akku Ka Chasma",
    type: "website",
    images: [
      {
        url: "https://akkukachasma.com/images/business-signup.jpg", // Add your actual image
        width: 1200,
        height: 630,
        alt: "Akku Ka Chasma Business Registration",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/signup",
  },
  other: {
    "google-site-verification": "your-verification-code", // Add if you have one
    "business-type": "B2B",
    "target-audience": "Optical Retailers",
  },
  verification: {
    google: "your-verification-code", // Add if you have one
  },
};

export default async function SignupPage() {

  const isMobile = await isMobileDevice();

  if (isMobile) {
    return (
      <div className="bg-primary h-screen w-screen flex flex-col overflow-auto">
        <div className="bg-transparent text-primary-foreground h-1/5 flex-shrink-0 px-4 ">
          <div className="flex items-center justify-between h-[60px]">
            <Link href="/" aria-label="Back to home">
              <ChevronLeft className="size-6" />
            </Link>
            <Logo imageClassName="invert" />
          </div>
        </div>
        <div className="bg-primary-foreground flex-grow rounded-t-[40px] overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <SignupForm />
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-background to-secondary pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Navigation */}
      <AuthHeader>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Already have an account?
        </Link>
      </AuthHeader>

      <main className="app-container mx-auto w-full flex-1 px-4 py-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left side - Form */}
          <div className="order-2 lg:order-1 flex flex-col">
            <SignupForm />
          </div>

          {/* Right side - Features */}
          <div className="order-1 lg:order-2 lg:pl-8 grid place-content-center h-full">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl text-center">
                Welcome to Akku Ka Chasma
              </h1>
              <p className="mt-4 text-lg text-muted-foreground text-center">
                Join India's leading wholesale eyewear marketplace. Create your
                business account today.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <FeatureCard
                icon={Truck}
                title="Fast Delivery"
                description="Quick shipping and hassle-free returns across India"
              />
              <FeatureCard
                icon={Glasses}
                title="Wide Selection"
                description="Choose from thousands of designs and brands"
              />
            </div>

            {/* Trust Indicators - Enhanced Version */}
            <div className="mt-6 p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                <StatCard
                  icon={Users}
                  value="2000+"
                  label="Active Customers"
                />
                <StatCard icon={Handshake} value="13 Years" label="Customer Trust" />
                <StatCard icon={Star} value="4.8/5" label="Customer Rating" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
