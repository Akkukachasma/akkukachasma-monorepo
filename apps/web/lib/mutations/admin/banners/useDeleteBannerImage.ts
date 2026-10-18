import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setItemToDelete } from "@/store/banners/banner-image.slice";
import { useParams } from "next/navigation";

const useDeleteBannerImage = (onSuccess?: () => void) => {
  const params = useParams<{ id: string }>();
  const bannerId = params?.id || "";
  const itemToDelete = useAppSelector(
    (store) => store.bannerStore.bannerImageStore.itemToDelete,
  );
  const dispatch = useAppDispatch();

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(
        ENDPOINTS.admin.banners.banner_images.delete(itemToDelete?.id || ""),
      );
      return res.data;
    },
    onSuccess: (_data) => {
      if (onSuccess) onSuccess();
      dispatch(setItemToDelete(null));
      if (bannerId) {
        queryClient.invalidateQueries({
          queryKey: [ENDPOINTS.admin.banners.banner_images.fetch_all(bannerId)],
        });
        queryClient.invalidateQueries({
          queryKey: [ENDPOINTS.admin.banners.fetch_one(bannerId)],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["banners"] });
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

export default useDeleteBannerImage;
