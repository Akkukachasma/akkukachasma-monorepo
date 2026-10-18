import { getApiClient, getErrorMessage, RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { toast } from "@/lib/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface GetInquiriesParams {
  page?: number;
  page_size?: number;
  search_term?: string;
  source?: string;
  email?: string;
  phone?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
}

interface Inquiry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message?: string;
  source: "contact_us" | "product_page" | "blog" | "other";
  created_at: string;
  updated_at: string;
  address?: any;
}

interface GetInquiriesResponse {
  success: boolean;
  data: Inquiry[];
  total: number;
  page: number;
  page_size: number;
}

const useGetInquiries = (params: GetInquiriesParams = {}) => {
  const api = getApiClient();

  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      queryString.append(key, value.toString());
    }
  });

  return useQuery<GetInquiriesResponse, RequestError>({
    queryKey: ["inquiries", params],
    queryFn: async () => {
      const response = await api.get(
        ENDPOINTS.inquiries.fetch_all(queryString.toString()),
      );
      return response.data;
    },
  });
};

export default useGetInquiries;
