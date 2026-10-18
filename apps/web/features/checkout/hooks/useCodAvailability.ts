import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";

type CodAvailabilityResponse = {
  cod_enabled: boolean;
};

const useCodAvailability = () => {
  const api = getApiClient();

  return useQuery<boolean>({
    queryKey: ["cod-availability"],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.company_info.cod_enabled,
      );
      const data = response.data?.data as CodAvailabilityResponse | undefined;
      return data?.cod_enabled ?? true;
    },
    staleTime: 60 * 1000,
  });
};

export default useCodAvailability;
