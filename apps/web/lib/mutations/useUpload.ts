import { useMutation } from "@tanstack/react-query";
import { getApiClient, getErrorMessage, RequestError } from "../api";
import ENDPOINTS from "../endpoints";
import { toast } from "../hooks/use-toast";
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";

const api = getApiClient({ multipart: true });

const upload = async ({ file, name }: { file: File; name: string }) => {
  if (!isWithinUploadLimit(file.size)) {
    throw new Error(uploadLimitExceededMessage());
  }
  const formData = new FormData();
  formData.append(name, file);
  const response = await api.post(ENDPOINTS.upload, formData);
  return response.data.data;
};

const useUpload = () => {
  return useMutation({
    mutationFn: async ({
      files,
      name = "file",
    }: {
      files: File[];
      name?: string;
    }) => {
      for (const file of files) {
        if (!isWithinUploadLimit(file.size)) {
          throw new Error(uploadLimitExceededMessage());
        }
      }
      const uploadPromises = files.map((file) => upload({ file, name }));
      const responses = await Promise.all(uploadPromises);
      return responses;
    },
    onError: (error: RequestError | Error) => {
      const message =
        error instanceof Error && !(error as RequestError).response
          ? error.message
          : getErrorMessage(error as RequestError);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    },
  });
};
export default useUpload;
