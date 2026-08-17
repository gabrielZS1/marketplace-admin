import { create } from "zustand";
import { businessApi } from "../api/businessApi";

export const useBusinessStore = create((set) => ({
  status: null,
  isLoading: false,

  async fetchStatus() {
    set({ isLoading: true });

    try {
      const data = await businessApi.getMyStatus();

      console.log("========== BUSINESS STATUS ==========");
      console.log(JSON.stringify(data, null, 2));
      console.log("=====================================");

      set({
        status: data,
        isLoading: false,
      });

      return data;
    } catch (err) {
      console.log("========== BUSINESS STATUS ERRO ==========");
      console.log(err.response?.status);
      console.log(err.response?.data);
      console.log("==========================================");

      set({ isLoading: false });

      throw err;
    }
  },
}));