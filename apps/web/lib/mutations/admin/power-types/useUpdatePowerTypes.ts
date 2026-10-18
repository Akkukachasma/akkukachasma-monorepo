import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { powerTypeSchema } from "@/lib/validations/admin/power-type.validation";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/power-types/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdatePowerType = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("power_type_image");

  const power_type_id = useAppSelector(
    (store) => store.powerTypeStore.formStore.power_type_id,
  );

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof powerTypeSchema> & { image?: string },
    ) => {
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.put(
        ENDPOINTS.admin.power_types.update(power_type_id),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
      dispatch(resetStore());
      if (onSuccess) onSuccess();
      removeUploadedImageFromSession();
      queryClient.invalidateQueries({ queryKey: ["power-types"] });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        variant: "destructive",
        description: message,
      });
    },
  });
  return mutation;
};

export default useUpdatePowerType;
