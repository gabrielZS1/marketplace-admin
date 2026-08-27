import { apiClient } from "./client";

export const businessApi = {
  async getMyStatus() {
    try {
      const { data } = await apiClient.get("/businesses/mine/status");
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async getDetails(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}`);
    return data;
  },

  async updateDetails(businessId, data) {
    const { data: responseData } = await apiClient.patch(
      `/businesses/${businessId}/details`,
      data
    );
    return responseData;
  },

  async uploadLogo(businessId, imageUri) {
    const formData = new FormData();

    formData.append("file", {
      uri: imageUri,
      name: "logo.jpg",
      type: "image/jpeg",
    });

    const { data } = await apiClient.post(
      `/businesses/${businessId}/logo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data;
  },

  async uploadPhoto(businessId, imageUri, category = "PORTFOLIO") {
    const formData = new FormData();

    formData.append("file", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    const { data } = await apiClient.post(
      `/businesses/${businessId}/photos?category=${category}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data;
  },
};