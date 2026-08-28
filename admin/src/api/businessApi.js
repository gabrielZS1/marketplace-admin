import { apiClient } from "./client";

export const businessApi = {
  // Status da assinatura do negócio do dono logado.
  // Sempre liberado pelo backend, mesmo com a assinatura bloqueada.
  async getMyStatus() {
    try {
      const { data } = await apiClient.get("/businesses/me");
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

  // Horários do estabelecimento (só os de nível empresa, sem os específicos de funcionário)
  async getWorkingHours(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/working-hours`);
    return (Array.isArray(data) ? data : []).filter((w) => !w.employeeId);
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

  async listPhotos(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/photos`);
    return Array.isArray(data) ? data : [];
  },

  async deletePhoto(businessId, photoId) {
    await apiClient.delete(`/businesses/${businessId}/photos/${photoId}`);
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
