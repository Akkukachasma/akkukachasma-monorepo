"use client";
import { useSearchParams } from "next/navigation";
import SendPasswordResetLink from "../forgot-password/SendPasswordResetLinkForm";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordForms = () => {
  const token = useSearchParams()?.get("token");

  if (!token) {
    return <SendPasswordResetLink />;
  }

  return <ResetPasswordForm token={token} />;
};
export default ResetPasswordForms;
