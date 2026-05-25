import api from "./api";
import type { Resource } from "@/types";

export const resourceService = {
  async getAll(
    subjectId: string,
    params?: {
      chapter_id?: string;
      resource_type?: string;
      status?: string;
      importance?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const response = await api.get<{ resources: Resource[]; total: number }>(
      `/api/subjects/${subjectId}/resources`,
      { params }
    );
    return response.data;
  },

  async getById(subjectId: string, resourceId: string) {
    const response = await api.get<Resource>(
      `/api/subjects/${subjectId}/resources/${resourceId}`
    );
    return response.data;
  },

  async create(subjectId: string, data: Partial<Resource>) {
    const response = await api.post<Resource>(
      `/api/subjects/${subjectId}/resources`,
      data
    );
    return response.data;
  },

  async update(subjectId: string, resourceId: string, data: Partial<Resource>) {
    const response = await api.put<Resource>(
      `/api/subjects/${subjectId}/resources/${resourceId}`,
      data
    );
    return response.data;
  },

  async delete(subjectId: string, resourceId: string) {
    await api.delete(`/api/subjects/${subjectId}/resources/${resourceId}`);
  },
};
