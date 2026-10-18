import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TryAtHomeFormValues } from "../tryathome.validations";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";

const useCreateTryAtHome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TryAtHomeFormValues) => {
      const api = getApiClient();
      const response = await api.post(ENDPOINTS.tryathome.create, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        description:
          "Try at home request submitted successfully! We will contact you soon.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["tryathome"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to submit try at home request. Please try again.";
      toast({ description: message, variant: "destructive" });
    },
  });
};

export default useCreateTryAtHome;
