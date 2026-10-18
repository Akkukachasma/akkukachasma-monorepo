import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { IUser } from "@/lib/types";
import { AUTH_DETAILS_QUERY_KEY } from "../query-keys";

const useLoggedInUser = () => {
  const api = getApiClient();
  return useQuery<IUser>({
    queryKey: AUTH_DETAILS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.AUTH.details);
      return res.data?.data;
    },
    staleTime: 60 * 1000,
  });
};
export default useLoggedInUser;
