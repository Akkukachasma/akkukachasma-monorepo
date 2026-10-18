import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/frame-materials/form.slice";//chnge
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { frameMaterialSchema } from "@/lib/validations/admin/frame-materials.validation";

const useCreateFrameMaterials = (onSuccess?: () => void) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof frameMaterialSchema>) => {
      const res = await api.post(ENDPOINTS.admin.frame_materials.create, data);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(resetStore());
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["frame-materials"] });
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

export default useCreateFrameMaterials;
