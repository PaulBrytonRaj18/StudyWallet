import api from "./api";
import type { Subject } from "@/types";

export const subjectService = {
  async getAll() {
    const response = await api.get<{ subjects: Subject[]; total: number }>("/api/subjects");
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Subject>(`/api/subjects/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string; color?: string; icon?: string }) {
    const response = await api.post<Subject>("/api/subjects", data);
    return response.data;
  },

  async update(id: string, data: Partial<Subject>) {
    const response = await api.put<Subject>(`/api/subjects/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/api/subjects/${id}`);
  },

  async getStats(id: string) {
    const response = await api.get(`/api/subjects/${id}/stats`);
    return response.data;
  },
};
