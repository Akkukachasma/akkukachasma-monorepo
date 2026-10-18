import AuthHeader from "@/components/navigation/AuthHeader";
import { Shield, Lock, Eye, FileKey, LucideIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Akku Ka Chasma",
  description:
    "Learn how Akku Ka Chasma collects, protects, and manages your personal information. Read about our data protection measures, cookie policy, and your privacy rights.",
  keywords: [
    "privacy policy",
    "data protection",
    "cookie policy",
    "personal information",
    "data security",
    "privacy rights",
    "information collection",
    "data sharing",
    "GDPR compliance",
    "customer privacy",
  ],
  openGraph: {
    title: "Privacy Policy | Akku Ka Chasma",
    description:
      "Learn how Akku Ka Chasma collects, protects, and manages your personal information. Read about our data protection measures, cookie policy, and your privacy rights.",
    url: "https://akkukachasma.com/privacy",
    siteName: "Akku Ka Chasma",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://akkukachasma.com/privacy",
  },
  authors: [
    {
      name: "Akku Ka Chasma Legal Team",
    },
  ],
  other: {
    "last-modified": "2024-02-15",
    "privacy-contact": "privacy@akkuchasma.com",
  },
  verification: {
    google: "your-google-verification-code", // Add if you have one
  },
};
export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-background to-secondary pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AuthHeader>
        <></>
      </AuthHeader>
      <div className="app-container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            How we collect, use, and protect your information
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {/* Key Points Summary */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <PrivacyCard
              icon={Eye}
              title="Data Collection"
              points={[
                "Business information",
                "Order history",
                "Payment details",
                "Usage statistics",
              ]}
            />
            <PrivacyCard
              icon={Lock}
              title="Data Protection"
              points={[
                "SSL encryption",
                "Secure storage",
                "Regular audits",
                "Access controls",
              ]}
            />
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 prose prose-gray dark:prose-invert">
            <PrivacySection
              title="1. Information We Collect"
              content="We collect information that you provide directly to us, including your business details, contact information, and transaction data."
            />

            <PrivacySection
              title="2. How We Use Your Information"
              bullets={[
                "Process your orders and transactions",
                "Provide customer support",
                "Send important updates about our services",
                "Improve our products and services",
              ]}
            />

            <PrivacySection
              title="3. Information Sharing"
              content="We do not sell your personal information. We may share your information with service providers who assist in our operations."
            />

            <PrivacySection
              title="4. Data Security"
              content="We implement appropriate technical and organizational measures to protect your information against unauthorized access or disclosure."
            />

            <PrivacySection
              title="5. Your Rights"
              bullets={[
                "Access your personal information",
                "Request corrections to your data",
                "Delete your account",
                "Opt-out of marketing communications",
              ]}
            />

            {/* Cookie Policy Summary */}
            <div className="bg-accent/50 p-6 rounded-lg">
              <div className="flex items-start space-x-4">
                <FileKey className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Cookie Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, analyze
                    site traffic, and personalize content. By continuing to use
                    our website, you consent to our use of cookies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-6 border-t">
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <p className="text-muted-foreground">
              If you have any questions about our Privacy Policy, please contact
              our Data Protection Officer at{" "}
              <a
                href="mailto:privacy@akkuchasma.com"
                className="text-primary hover:underline"
              >
                privacy@akkuchasma.com
              </a>
            </p>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-sm text-muted-foreground">
            Last updated: February 15, 2024
          </div>
        </div>
      </div>
    </div>
  );
}

interface PrivacyCardProps {
  icon: LucideIcon;
  title: string;
  points: string[];
}

const PrivacyCard: React.FC<PrivacyCardProps> = ({
  icon: Icon,
  title,
  points,
}) => {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <Icon className="h-6 w-6 text-primary mb-4" />
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {points.map((point, index) => (
          <li key={index} className="flex items-center space-x-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface PrivacySectionProps {
  title: string;
  content?: string;
  bullets?: string[];
}

const PrivacySection: React.FC<PrivacySectionProps> = ({
  title,
  content,
  bullets,
}) => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {content && <p className="text-muted-foreground">{content}</p>}
      {bullets && (
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
