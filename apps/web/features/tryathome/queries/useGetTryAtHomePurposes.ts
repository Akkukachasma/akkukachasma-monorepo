import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";

export interface TryAtHomePurpose {
  id: string;
  label: string;
  created_at: string;
  updated_at: string;
  requests_count?: number;
}

const useGetTryAtHomePurposes = () => {
  return useFetch<TryAtHomePurpose[]>({
    endpoint: ENDPOINTS.admin.tryathome.purposes.fetch_all,
  });
};

export default useGetTryAtHomePurposes;
