import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient } from "@/lib/api";

export type PincodeValidationData = {
  pincode: string;
  isValid: boolean;
  city?: string | null;
  state?: string | null;
  district?: string | null;
  state_code?: string | null;
  suggestions?: {
    cities: string[];
    states: string[];
    districts: string[];
  };
};

export const normalizePincode = (value: unknown): string =>
  String(value ?? "").replace(/\D/g, "").slice(0, 6);

const useValidatePincode = (pincode: string) => {
  const normalized = normalizePincode(pincode);
  const isComplete = normalized.length === 6;

  return useQuery({
    queryKey: ["validate-pincode", normalized],
    enabled: isComplete,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async (): Promise<PincodeValidationData> => {
      const api = getApiClient();
      const res = await api.get(ENDPOINTS.account.validate_pincode(normalized));
      const body = res.data;

      if (!body?.success || !body?.data?.isValid) {
        throw new Error(body?.message || "Invalid pincode");
      }

      return body.data as PincodeValidationData;
    },
  });
};

export default useValidatePincode;
