import { create } from "zustand";
import { businessApi } from "../api/businessApi";

// Deriva se o dono está bloqueado (trial expirado ou pagamento suspenso).
function isBlocked(status) {
  if (!status) return false;
  if (status.active === false) return true;
  return status.subscriptionStatus === "EXPIRED" || status.subscriptionStatus === "SUSPENDED";
}

export const useBusinessStore = create((set, get) => ({
  status: null,
  isLoading: false,

  async fetchStatus() {
    set({ isLoading: true });

    try {
      const data = await businessApi.getMyStatus();

      set({
        status: data,
        isLoading: false,
      });

      return data;
    } catch (err) {
      console.log("BUSINESS STATUS ERRO:", err.response?.status, err.response?.data);
      set({ isLoading: false });
      throw err;
    }
  },

  // Chamado pelo interceptor do axios quando qualquer request volta 403 SUBSCRIPTION_BLOCKED.
  // Trava o app na hora e dispara um refetch pra pegar os dados atualizados.
  applyBlock(reason) {
    const current = get().status;
    const subscriptionStatus =
      reason === "PAYMENT_FAILED" ? "SUSPENDED" : "EXPIRED";

    set({
      status: {
        ...(current || {}),
        active: false,
        blockReason: reason || current?.blockReason || "TRIAL_EXPIRED",
        subscriptionStatus,
      },
    });

    get().fetchStatus().catch(() => {});
  },

  isBlocked() {
    return isBlocked(get().status);
  },
}));
