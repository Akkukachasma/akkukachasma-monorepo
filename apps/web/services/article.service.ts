import { IArticle } from "@/components/articles/ListItem";
import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { IPaginatedResponse } from "@/lib/types";

export const fetchPopularArticles = async (): Promise<IArticle[]> => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.blog.fetch_popular);
  return response.data.data;
};

export const fetchPublishedArticles = async (): Promise<
  IPaginatedResponse<IArticle>
> => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.blog.fetch_published);
  return response.data;
};

export const fetchArticleBySlug = async (slug: string): Promise<IArticle> => {
  const api = getApiClient();
  const response = await api.get(ENDPOINTS.blog.fetch_single_article(slug));
  return response.data.data;
};
