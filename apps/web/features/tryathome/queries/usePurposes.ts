import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";

const usePurposes = () => {
  return useFetch({
    endpoint: ENDPOINTS.tryathome.purposes,
  });
};
