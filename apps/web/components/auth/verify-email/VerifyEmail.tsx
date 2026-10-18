"use client";
import React from "react";
import { notFound, useSearchParams } from "next/navigation";
import useVerifyEmail from "@/lib/mutations/auth/verify-email/userVerifyEmail";
import { useRouter } from "next/navigation"; // For navigation
import Verified from "./cards/Verified";
import Verifying from "./cards/Verifying";
import VerifiedAlready from "./cards/VerifiedAlready";
import TokenExpired from "./cards/TokenExpired";
import useResendVerification from "@/lib/mutations/auth/verify-email/useResendVerification";
import ServerError from "./cards/ServerError";

const VerifyEmail: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");
  const router = useRouter();

  const { mutate, isPending, error, isSuccess } = useVerifyEmail();
  const { mutate: resendMutate, isPending: resendIsPending } =
    useResendVerification();

  React.useEffect(() => {
    if (token) {
      mutate(token);
    }
  }, [token, mutate]);

  const handleRetry = () => {
    resendMutate({ email: email || "" });
  };

  const handleClose = () => {
    router.push("/login");
  };

  if (!token || !email) {
    notFound();
  }

  if (token && isPending) {
    return <Verifying />;
  }

  if (token && isSuccess) {
    return <Verified />;
  }
  if (token && error) {
    return (
      <React.Fragment>
        {error?.response?.data?.type === "ERR_TOKEN_EXPIRED" ? (
          <TokenExpired
            onClick={handleRetry}
            message={`${error?.response?.data?.message}`}
          />
        ) : error?.response?.data?.type === "ERR_ALREADY_VERIFIED" ? (
          <VerifiedAlready
            onClick={handleClose}
            message={`${error?.response?.data?.message}`}
          />
        ) : error?.response?.data?.type === "ERR_TOKEN_INVALID" ? (
          <TokenExpired
            onClick={handleRetry}
            message={`${error?.response?.data?.message}`}
          />
        ) : (
          error?.response?.data?.type === "INTERNAL_SERVER_ERR" && (
            <ServerError />
          )
        )}
      </React.Fragment>
    );
  }
};

export default VerifyEmail;
