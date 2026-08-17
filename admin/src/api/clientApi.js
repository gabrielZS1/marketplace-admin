import { apiClient } from "./client";

export const clientApi = {
  async listByBusiness(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/clients`);
    return data;
  },
};