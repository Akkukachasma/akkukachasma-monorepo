import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";
import type { GetRoleResponse, RoleDetail } from "../types";

const useGetRole = (id: string | null) => {
  const api = getApiClient();

  const result = useQuery<RoleDetail | null>({
    queryKey: ["roles", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get<GetRoleResponse>(
        ENDPOINTS.admin.roles.fetch_one(id),
      );
      if (!response.data?.success || !response.data.data) {
        return null;
      }
      return response.data.data;
    },
    enabled: !!id,
  });

  return {
    data: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    query: result,
  };
};

export default useGetRole;
