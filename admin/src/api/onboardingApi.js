import { apiClient } from "./client";

export const onboardingApi = {
  async start(category) {
    const { data } = await apiClient.post("/businesses/onboarding/start", { category });
    return data;
  },

  async basicInfo(businessId, { name, description }) {
    const { data } = await apiClient.patch(`/businesses/onboarding/${businessId}/basic-info`, {
      name,
      description,
    });
    return data;
  },

  async workLocation(businessId, workLocationType) {
    const { data } = await apiClient.patch(`/businesses/onboarding/${businessId}/work-location`, {
      workLocationType,
    });
    return data;
  },

  async address(businessId, addressData) {
    const { data } = await apiClient.patch(`/businesses/onboarding/${businessId}/address`, addressData);
    return data;
  },

  async teamSize(businessId, teamSize) {
    const { data } = await apiClient.patch(`/businesses/onboarding/${businessId}/team-size`, { teamSize });
    return data;
  },

  async workingHours(businessId, entries) {
    const { data } = await apiClient.put(`/businesses/onboarding/${businessId}/working-hours`, { entries });
    return data;
  },

  async complete(businessId, promoCode) {
  const { data } = await apiClient.post(`/businesses/onboarding/${businessId}/complete`, {
    promoCode: promoCode || null,
  });
  return data;
},
};