import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";

export interface PermissionItem {
  id: string;
  code: string;
  name?: string | null;
  description?: string | null;
}

interface GetPermissionsResponse {
  success: boolean;
  data: PermissionItem[];
}

const useGetPermissions = () => {
  const api = getApiClient();

  const result = useQuery<PermissionItem[]>({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const response = await api.get<GetPermissionsResponse>(
        ENDPOINTS.admin.roles.permissions,
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

export default useGetPermissions;
