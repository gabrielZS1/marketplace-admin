import { apiClient } from "./client";

export const statsApi = {
  async get(businessId, days = 30) {
    const { data } = await apiClient.get(`/businesses/${businessId}/stats`, {
      params: { days },
    });
    return data;
  },
};
