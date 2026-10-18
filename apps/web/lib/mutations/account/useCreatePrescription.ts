import { useMutation, useQueryClient } from "@tanstack/react-query";
import ENDPOINTS from "@/lib/endpoints";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";
import type { IPrescription } from "@/lib/types/prescription";

export type CreatePrescriptionPayload =
  | {
      type: "fillup";
      comments?: string;
      right_sph: string;
      right_cyl: string;
      right_axis: string;
      right_add: string;
      left_sph: string;
      left_cyl: string;
      left_axis: string;
      left_add: string;
    }
  | {
      type: "photo";
      image: string;
      comments: string;
    };

const useCreatePrescription = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePrescriptionPayload) => {
      const res = await api.post<{
        data: IPrescription;
        message: string;
      }>(ENDPOINTS.account.create_prescription, data);
      return res.data;
    },
    onSuccess: (body) => {
      toast({ description: body.message, variant: "default" });
      void queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.account.fetch_prescriptions],
      });
    },
    onError: (err: RequestError) => {
      toast({
        description: getErrorMessage(err),
        variant: "destructive",
      });
    },
  });
};

export default useCreatePrescription;
