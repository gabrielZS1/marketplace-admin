import { apiClient } from "./client";

export const businessApi = {
  async getMyStatus() {
    try {
      const { data } = await apiClient.get(
        "/businesses/mine/status"
      );

      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }

      throw err;
    }
  },

  async getDetails(businessId) {
    const { data } = await apiClient.get(
      `/businesses/${businessId}`
    );

    return data;
  },

  async updateDetails(businessId, data) {
    const { data: responseData } = await apiClient.patch(
      `/businesses/${businessId}/details`,
      data
    );

    return responseData;
  },
};