import api from "./api";
import type { AuthResponse, User } from "@/types";

export const authService = {
  async register(data: { email: string; username: string; password: string; full_name?: string }) {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get<User>("/api/auth/me");
    return response.data;
  },
};
