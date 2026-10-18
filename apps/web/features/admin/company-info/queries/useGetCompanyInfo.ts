import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";

export interface CompanyInfo {
  id: string;
  cod_enabled?: boolean;
  company_name: string;
  store_name: string;
  store_address: string;
  full_address: string;
  email: string;
  phone: string;
  website: string;
  gstin: string;
  cin?: string;
  pan?: string;
  signature?: string | null;
  created_at: string;
  updated_at: string;
  updated_by: {
    id: string;
    name: string;
    email: string;
  };
}

const useGetCompanyInfo = () => {
  const api = getApiClient();

  return useQuery<CompanyInfo>({
    queryKey: ["company-info"],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.company_info.fetch_details,
      );
      return response.data.data;
    },
  });
};

export default useGetCompanyInfo;
