import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";
import type { IPrescription } from "@/lib/types/prescription";

const usePrescriptions = () => {
  return useFetch<IPrescription[]>({
    endpoint: ENDPOINTS.account.fetch_prescriptions,
  });
};

export default usePrescriptions;
