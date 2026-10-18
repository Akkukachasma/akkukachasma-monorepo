import { IAddress } from "@/components/account/addresses/Address";
import ENDPOINTS from "@/lib/endpoints";
import useFetch from "@/lib/hooks/use-fetch";

const useAddresses = () => {
  return useFetch<IAddress[]>({ endpoint: ENDPOINTS.account.fetch_addresses });
};
export default useAddresses;
