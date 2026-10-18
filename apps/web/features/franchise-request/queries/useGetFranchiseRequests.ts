import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPage, setTotal } from "../store/franchise-requests.slice";
import { generateQueryString } from "@/lib/utils";

export type FranchiseRequestStatus = "pending" | "approved";

export interface GetFranchiseRequestsParams {
  status: FranchiseRequestStatus;
  page_size?: number;
}

export interface FranchiseRequest {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  status: FranchiseRequestStatus;
  owner: string;
  other_owner?: string;
  nearby: string;
  other_near_by?: string;
  message?: string;
  created_at: string;
  updated_at?: string | null;
  address?: {
    city: string;
    state: string;
    zip_code: string;
    address: string;
    country: string;
  };
}

export interface GetFranchiseRequestsResponse {
  data: FranchiseRequest[];
  total: number;
  page: number;
  page_size: number;
}

/** Normalize Nest paginated JSON (axios puts the body on `response.data`). */
function parsePaginatedBody(body: unknown): {
  rows: FranchiseRequest[];
  total: number;
} {
  if (!body || typeof body !== "object") {
    return { rows: [], total: 0 };
  }
  const b = body as Record<string, unknown>;
  const total = typeof b.total === "number" ? b.total : 0;
  const raw = b.data;
  const rows = Array.isArray(raw) ? (raw as FranchiseRequest[]) : [];
  return { rows, total };
}

const DEFAULT_PAGE_SIZE = 12;

export type FranchiseRequestsQueryData = {
  rows: FranchiseRequest[];
  total: number;
};

const useGetFranchiseRequests = ({
  status,
  page_size = DEFAULT_PAGE_SIZE,
}: GetFranchiseRequestsParams) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const {
    total,
    page,
    search_term,
    sort_by,
    email,
    phone_number,
    start_date,
    end_date,
  } = useAppSelector((state) => state.franchiseRequestStore.data);

  const result = useQuery({
    queryKey: [
      "admin-franchise-requests",
      status,
      page,
      page_size,
      search_term,
      sort_by,
      email,
      phone_number,
      start_date,
      end_date,
    ],
    queryFn: async (): Promise<FranchiseRequestsQueryData> => {
      const filterObj: Record<string, string> = {
        page: String(page),
        page_size: String(page_size),
        status,
        sort_by,
        ...(search_term.trim() ? { search_term: search_term.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone_number.trim() ? { phone_number: phone_number.trim() } : {}),
        ...(start_date ? { start_date } : {}),
        ...(end_date ? { end_date } : {}),
      };

      const queryString = generateQueryString(filterObj);

      const response = await api.get(
        ENDPOINTS.admin.franchise_requests.fetch_all(queryString),
      );

      const { rows, total: responseTotal } = parsePaginatedBody(response.data);
      dispatch(setTotal(responseTotal));
      return { rows, total: responseTotal };
    },
  });

  const queryTotal = result.data?.total;
  const displayTotal =
    typeof queryTotal === "number" ? queryTotal : total;

  const pageCount = Math.max(1, Math.ceil(displayTotal / page_size));

  React.useEffect(() => {
    if (page > pageCount) {
      dispatch(setPage(pageCount));
    }
  }, [page, pageCount, dispatch]);

  return {
    data: result.data?.rows,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    page,
    pageCount,
    pageSize: page_size,
    total: displayTotal,
    refetch: result.refetch,
  };
};

export default useGetFranchiseRequests;
