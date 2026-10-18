import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";

const useTaxes = () => {
  return useFetch({ endpoint: ENDPOINTS.admin.settings.taxes.fetch_all });
};
export default useTaxes;
