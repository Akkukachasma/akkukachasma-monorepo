import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

export interface CreateCompanyInfoData {
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
}

const useCreateCompanyInfo = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyInfoData) => {
      const response = await api.post(
        ENDPOINTS.admin.company_info.create,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Company Info Created",
        description: "Company information has been successfully created.",
      });

      queryClient.invalidateQueries({ queryKey: ["company-info"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create company info",
        variant: "destructive",
      });
    },
  });
};

export default useCreateCompanyInfo;
