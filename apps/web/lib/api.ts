import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";
import { TOKENS } from "./constants";
import { uploadLimitExceededMessage } from "./upload-limits";

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.NODE_ENV !== "development") {
    return "https://api.akkukachasma.com";
  }

  return "http://localhost:8001";
};

export const baseURL = getBaseUrl() + "/v1";

type ApiClientProps = {
  multipart?: boolean;
  token?: string;
};

export const getApiClient = (params?: ApiClientProps) => {
  const { multipart, token } = params || {};

  const finalToken = token || getCookie(TOKENS.AUTH_TOKEN); // Use the token passed in or the stored cookie

  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Authorization: finalToken ? `Bearer ${finalToken}` : undefined, // Set Bearer token
      "Content-Type": multipart ? "multipart/form-data" : "application/json",
    },
  });
};

export type RequestError = AxiosError & {
  response: {
    data: {
      success?: boolean;
      message?: string;
      type?: string;
      code?: string;
      error?: any;
    };
  };
};

export const PINCODE_SERVICEABILITY_UNAVAILABLE =
  "PINCODE_SERVICEABILITY_UNAVAILABLE";

export const isPincodeServiceabilityUnavailable = (
  error: RequestError | unknown,
): boolean => {
  const data = (error as RequestError)?.response?.data;
  return (
    data?.code === PINCODE_SERVICEABILITY_UNAVAILABLE ||
    data?.type === PINCODE_SERVICEABILITY_UNAVAILABLE
  );
};

export const getErrorMessage = (error: RequestError) => {
  let message;
  if (
    Array.isArray(error?.response?.data?.message) &&
    error?.response?.data?.message.length > 0
  ) {
    message = error?.response?.data?.message[0];
  } else {
    message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
  }

  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const lower = String(message ?? "").toLowerCase();
  if (
    code === "UPLOAD_FILE_TOO_LARGE" ||
    status === 413 ||
    lower.includes("content too large") ||
    lower.includes("payload too large") ||
    lower.includes("file too large") ||
    lower.includes("limit_file_size")
  ) {
    return uploadLimitExceededMessage();
  }

  return message;
};
