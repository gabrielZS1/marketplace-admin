import { apiClient } from "./client";

export const subscriptionApi = {
  async subscribeNow(businessId) {
    const { data } = await apiClient.post(`/businesses/${businessId}/subscribe`);
    return data;
  },
};