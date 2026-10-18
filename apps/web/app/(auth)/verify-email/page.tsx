import { notFound } from "next/navigation";
import React from "react";
import VerifyEmail from "@/components/auth/verify-email/VerifyEmail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email | Akku Ka Chasma",
  description:
    "Verify your email address to complete your registration with Akku Ka Chasma and access your account.",
  keywords: [
    "email verification",
    "account verification",
    "verify account",
    "confirm email",
    "email confirmation",
    "account activation",
  ],
  robots: { index: true, follow: true },
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  // Redirect to 404 if token is not present
  if (!token) {
    notFound();
  }

  return <VerifyEmail />;
};

export default Page;
