import { create } from "zustand";
import { onboardingApi } from "../api/onboardingApi";

export const useOnboardingStore = create((set, get) => ({
  businessId: null,
  category: null,
  isLoading: false,
  error: null,
  promoCode: null,

  async selectCategory(category) {
    set({ isLoading: true, error: null });
    try {
      const result = await onboardingApi.start(category);
      set({ businessId: result.businessId, category, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false, error: err.message || "Não foi possível continuar" });
      return { success: false };
    }
  },

  setPromoCode(code) {
    set({ promoCode: code });
  },
  
  reset() {
    set({ businessId: null, category: null, error: null, promoCode: null });
  },

  selectedAddress: null,

  setSelectedAddress(payload) {
    set({ selectedAddress: payload });
  },
}));