import api from "./api";
import type { Note } from "@/types";

export const noteService = {
  async getAll(params?: { subject_id?: string; page?: number; limit?: number }) {
    const response = await api.get<{ notes: Note[]; total: number }>("/api/notes", { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<Note>(`/api/notes/${id}`);
    return response.data;
  },

  async create(data: { title: string; content?: string; is_markdown?: boolean; subject_id?: string; chapter_id?: string }) {
    const response = await api.post<Note>("/api/notes", data);
    return response.data;
  },

  async update(id: string, data: Partial<Note>) {
    const response = await api.put<Note>(`/api/notes/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/api/notes/${id}`);
  },
};
