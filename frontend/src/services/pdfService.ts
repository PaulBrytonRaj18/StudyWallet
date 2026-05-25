import api from "./api";
import type { Resource } from "@/types";

export const pdfService = {
  async upload(
    file: File,
    data: {
      title: string;
      subject_id: string;
      chapter_id?: string;
      description?: string;
      tags?: string;
      importance?: string;
    }
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", data.title);
    formData.append("subject_id", data.subject_id);
    if (data.chapter_id) formData.append("chapter_id", data.chapter_id);
    if (data.description) formData.append("description", data.description);
    if (data.tags) formData.append("tags", data.tags);
    if (data.importance) formData.append("importance", data.importance);

    const response = await api.post<Resource>("/api/pdfs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getSignedUrl(resourceId: string) {
    const response = await api.get<{ signed_url: string; resource_id: string }>(
      `/api/pdfs/${resourceId}/signed-url`
    );
    return response.data;
  },

  async delete(resourceId: string) {
    await api.delete(`/api/pdfs/${resourceId}`);
  },
};
