import { RoleListItem } from "@/features/admin/roles";
import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { IUser } from "@/lib/types";

export type GetDetailsResponse = {
  success: boolean;
  data: IUser & {
    user_roles: {
      role: RoleListItem;
    }[];
    permissions?: string[];
  };
};

/**
 * Fetches auth/details. Works on server and client.
 * Pass token when calling from server (e.g. from cookies()); omit on client to use cookie.
 */
export async function getDetails(
  token?: string,
): Promise<GetDetailsResponse | null> {
  try {
    const api = getApiClient(token ? { token } : undefined);
    const response = await api.get<GetDetailsResponse>(ENDPOINTS.AUTH.details);
    return response.data;
  } catch {
    return null;
  }
}

/** Client-only: logs out and reloads. */
export async function logout(): Promise<void> {
  try {
    const api = getApiClient();
    const response = await api.delete("auth/logout");
    const msg = response.data.data?.message;
    toast({ description: msg });
    window.location.reload();
  } catch (error: unknown) {
    const message = getErrorMessage(error as RequestError);
    toast({ description: message, variant: "destructive" });
  }
}
