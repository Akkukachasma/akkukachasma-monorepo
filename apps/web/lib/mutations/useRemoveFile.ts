import { useMutation } from "@tanstack/react-query";
import { getApiClient, getErrorMessage, RequestError } from "../api";
import ENDPOINTS from "../endpoints";
import { toast } from "../hooks/use-toast";

const useRemoveFile = () => {
  const api = getApiClient();
  return useMutation({
    mutationFn: async (file_id: string) => {
      const response = await api.delete(ENDPOINTS.remove_file(file_id));
      return response.data.data;
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        title: "Removal failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};
export default useRemoveFile;
