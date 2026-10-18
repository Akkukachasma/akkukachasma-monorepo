import SendPasswordResetLinkForm from "@/components/auth/forgot-password/SendPasswordResetLinkForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Akku Ka Chasma",
  description:
    "Reset your Akku Ka Chasma account password. Enter your email to receive a secure password reset link.",
  robots: { index: true, follow: true },
};

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8 animate-smooth pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <SendPasswordResetLinkForm />
    </div>
  );
};

export default ForgotPasswordPage;
