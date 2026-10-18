import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/frame-materials/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { frameMaterialSchema } from "@/lib/validations/admin/frame-materials.validation";

const useUpdateFrameMaterials = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();

  const frame_material_id = useAppSelector(
    (store) => store.frameMaterialStore.formStore.frame_material_id,
  );

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof frameMaterialSchema>) => {
      
      
      const res = await api.put(
        ENDPOINTS.admin.frame_materials.update(frame_material_id),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
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

export default useUpdateFrameMaterials;
