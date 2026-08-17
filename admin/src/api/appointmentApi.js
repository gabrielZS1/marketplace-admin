import { apiClient } from "./client";

export const appointmentApi = {
  async listByBusiness(businessId) {
    const { data } = await apiClient.get(
      `/appointments/business/${businessId}`
    );

    return data;
  },

  async updateStatus(appointmentId, status) {
    const { data } = await apiClient.patch(
      `/appointments/${appointmentId}/status`,
      {
        status,
      }
    );

    return data;
  },
};