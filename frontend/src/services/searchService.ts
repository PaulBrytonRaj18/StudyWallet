import api from "./api";
import type { SearchResult } from "@/types";

export const searchService = {
  async search(params: {
    q?: string;
    resource_type?: string;
    status?: string;
    importance?: string;
    subject_id?: string;
    chapter_id?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<{
      results: SearchResult[];
      total: number;
      page: number;
      limit: number;
    }>("/api/search", { params });
    return response.data;
  },
};
