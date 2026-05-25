import api from "./api";
import type { AnalyticsData } from "@/types";

export const analyticsService = {
  async getDashboard() {
    const response = await api.get<AnalyticsData>("/api/analytics/dashboard");
    return response.data;
  },
};
