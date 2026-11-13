import { apiClient } from "./client";

export const subscriptionApi = {
  async subscribeNow(businessId) {
    const { data } = await apiClient.post(`/businesses/${businessId}/subscribe`);
    return data;
  },

  // Troca o plano (quantidade de profissionais). Devolve o status atualizado do negócio.
  async changePlan(businessId, teamSize) {
    const { data } = await apiClient.patch(`/businesses/${businessId}/plan`, { teamSize });
    return data;
  },
};
