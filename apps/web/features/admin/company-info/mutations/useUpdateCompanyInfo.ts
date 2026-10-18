import { getApiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

export interface UpdateCompanyInfoData {
  cod_enabled?: boolean;
  company_name?: string;
  store_name?: string;
  store_address?: string;
  full_address?: string;
  email?: string;
  phone?: string;
  website?: string;
  gstin?: string;
  cin?: string;
  pan?: string;
  signature?: string | null;
}

const useUpdateCompanyInfo = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCompanyInfoData;
    }) => {
      const response = await api.patch(
        ENDPOINTS.admin.company_info.update(id),
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Company Info Updated",
        description: "Company information has been successfully updated.",
      });

      queryClient.invalidateQueries({ queryKey: ["company-info"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update company info",
        variant: "destructive",
      });
    },
  });
};

export default useUpdateCompanyInfo;
