import api from "./api";
import type { Chapter } from "@/types";

export const chapterService = {
  async getAll(subjectId: string) {
    const response = await api.get<{ chapters: Chapter[]; total: number }>(
      `/api/subjects/${subjectId}/chapters`
    );
    return response.data;
  },

  async getById(subjectId: string, chapterId: string) {
    const response = await api.get<Chapter>(
      `/api/subjects/${subjectId}/chapters/${chapterId}`
    );
    return response.data;
  },

  async create(subjectId: string, data: { name: string; description?: string; order?: number }) {
    const response = await api.post<Chapter>(
      `/api/subjects/${subjectId}/chapters`,
      data
    );
    return response.data;
  },

  async update(subjectId: string, chapterId: string, data: Partial<Chapter>) {
    const response = await api.put<Chapter>(
      `/api/subjects/${subjectId}/chapters/${chapterId}`,
      data
    );
    return response.data;
  },

  async delete(subjectId: string, chapterId: string) {
    await api.delete(`/api/subjects/${subjectId}/chapters/${chapterId}`);
  },
};
