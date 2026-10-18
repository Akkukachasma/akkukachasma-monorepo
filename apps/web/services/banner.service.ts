import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";

export const fetchHomePageBanners = async () => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.admin.banners.fetch_home_page());
  return response.data;
};
