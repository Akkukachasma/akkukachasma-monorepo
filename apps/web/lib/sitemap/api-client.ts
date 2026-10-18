import axios from "axios";
import { getBaseUrl } from "@/lib/api";

export function getSitemapApiClient() {
  return axios.create({
    baseURL: `${getBaseUrl()}/v1`,
    headers: { "Content-Type": "application/json" },
    timeout: 60_000,
  });
}
