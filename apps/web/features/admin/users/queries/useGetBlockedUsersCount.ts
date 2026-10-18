import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";

const useGetBlockedUsersCount = () => {
  const api = getApiClient();

  return useQuery({
    queryKey: ["admin-users", "count", "blocked"],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.admin.users.fetch_all("blocked=true"),
      );
      return response.data.total || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useGetBlockedUsersCount;
