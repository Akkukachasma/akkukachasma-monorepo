import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteInquiry = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiryId: string) => {
      const response = await api.delete(ENDPOINTS.inquiries.delete(inquiryId));
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry deleted successfully",
        description: "The inquiry has been permanently removed.",
      });
      // Invalidate and refetch inquiries
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        title: "Failed to delete inquiry",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export default useDeleteInquiry;
