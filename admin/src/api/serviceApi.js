import { apiClient } from "./client";

export const serviceApi = {
  async list(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/services`);
    return data;
  },

  async create(businessId, service) {
    const { data } = await apiClient.post(`/businesses/${businessId}/services`, service);
    return data;
  },

  async remove(businessId, serviceId) {
    await apiClient.delete(`/businesses/${businessId}/services/${serviceId}`);
  },
};