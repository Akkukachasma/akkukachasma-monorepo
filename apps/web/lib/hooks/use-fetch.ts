import { useQuery } from "@tanstack/react-query";
import { AxiosRequestConfig } from "axios";
import { getApiClient } from "../api";

interface UseFetch {
  endpoint: string;
  extractData?: boolean;
  options?: AxiosRequestConfig;
  enabledKey?: any;
  validate?: boolean;
  initialData?: any;
}

const useFetch = <T>({
  endpoint,
  extractData = true,
  enabledKey,
  validate = false,
  options,
  initialData,
}: UseFetch) => {
  const api = getApiClient();

  const result = useQuery<T>({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await api.get(endpoint, { ...(options && options) });
      if (extractData) {
        return res.data?.data;
      }
      return res.data;
    },
    enabled: !validate ? true : Boolean(enabledKey) ? true : false,
    initialData,
  });
  return result;
};

export default useFetch;
