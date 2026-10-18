import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/banners/banner-image.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";
import { IBannerImage } from "@/components/banners/ListItem";
import { useParams } from "next/navigation";

const useUpdateBannerImage = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("banner_image");
  const params = useParams<{ id: string }>();
  const bannerId = params?.id || "";
  const storedData = useAppSelector(
    (store) => store.bannerStore.bannerImageStore.data,
  );

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: Omit<IBannerImage, "image"> & { image?: string },
    ) => {
      if (!storedData?.id) throw new Error("Banner ID is required");
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.put(
        ENDPOINTS.admin.banners.banner_images.update(storedData?.id || ""),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
      dispatch(resetStore());
      removeUploadedImageFromSession();
      if (onSuccess) onSuccess();
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

export default useUpdateBannerImage;
