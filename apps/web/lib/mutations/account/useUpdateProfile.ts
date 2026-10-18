import { useMutation } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import { z } from "zod";
import { toast } from "@/lib/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { formSchema } from "@/lib/validations/account.validations";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdateProfile = () => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("avatar");
  const api = getApiClient();
  const params = useSearchParams();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof formSchema> & { avatar?: string },
    ) => {
      if (uploadedImage?.is_temp) {
        data.avatar = uploadedImage.id;
      }
      const res = await api.put(ENDPOINTS.account.update_details, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        description: data.message,
        variant: "default",
      });
      if (uploadedImage?.is_temp) removeUploadedImageFromSession();
    },
    onError: (err: RequestError) => {
      const message = getErrorMessage(err);
      toast({
        description: message,
        variant: "destructive",
      });
    },
  });
  return mutation;
};

export default useUpdateProfile;
