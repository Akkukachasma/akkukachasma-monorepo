import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { GetRolesResponse, RoleListItem } from "../types";

const useGetRoles = () => {
  const api = getApiClient();

  const result = useQuery<RoleListItem[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get<GetRolesResponse>(
        ENDPOINTS.admin.roles.fetch_all,
      );
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        return [];
      }
      return response.data.data;
    },
  });

  return {
    data: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    query: result,
  };
};

export default useGetRoles;
