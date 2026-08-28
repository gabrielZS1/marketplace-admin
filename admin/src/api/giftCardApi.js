import { apiClient } from "./client";

export const giftCardApi = {
  async list(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/gift-cards`);
    return Array.isArray(data) ? data : [];
  },

  async create(businessId, giftCard) {
    const { data } = await apiClient.post(
      `/businesses/${businessId}/gift-cards`,
      giftCard
    );
    return data;
  },

  async remove(businessId, giftCardId) {
    await apiClient.delete(`/businesses/${businessId}/gift-cards/${giftCardId}`);
  },
};
