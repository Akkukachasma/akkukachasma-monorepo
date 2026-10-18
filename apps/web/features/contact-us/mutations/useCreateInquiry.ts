import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { ContactFormValues } from "../contact.validation";

const useCreateInquiry = () => {
  const api = getApiClient();
  return useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await api.post(ENDPOINTS.inquiries.create, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        title: "Failed to send message",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export default useCreateInquiry;
