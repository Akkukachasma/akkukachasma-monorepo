import React from "react";
import ResetPasswordForms from "@/components/auth/reset-password/ResetPasswordForms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Akku Ka Chasma",
  description:
    "Set a new password for your Akku Ka Chasma account using your secure reset link.",
  robots: { index: true, follow: true },
};

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8 animate-smooth pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <React.Suspense>
        <ResetPasswordForms />
      </React.Suspense>
    </div>
  );
};

export default ResetPasswordPage;
