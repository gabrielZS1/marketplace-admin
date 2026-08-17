import { create } from "zustand";
import { authApi } from "../api/authApi";
import { apiClient } from "../api/client";
import { secureStorage } from "../utils/secureStorage";
import { registerForPushNotificationsAsync } from "../../pushNotifications";

async function setupPushNotifications() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await apiClient.patch("/businesses/me/push-token", {
        expoPushToken: token,
      });
    }
  } catch (err) {
    console.error("Erro ao configurar push notifications:", err);
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });

      if (response.role !== "BUSINESS_OWNER") {
        set({
          isLoading: false,
          error: "Esta conta não é de um empresário. Use o app do cliente.",
        });
        return { success: false };
      }

      await secureStorage.saveToken(response.token);
      set({
        user: {
          name: response.name,
          role: response.role,
          address: response.address,
        },
        token: response.token,
        isLoading: false,
      });

      setupPushNotifications();

      return { success: true };
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || "E-mail ou senha inválidos",
      });
      return { success: false };
    }
  },

  async registerBusinessOwner({ name, email, phone, password }) {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.registerBusinessOwner({
        name,
        email,
        phone,
        password,
      });

      await secureStorage.saveToken(response.token);
      set({
        user: {
          name: response.name,
          role: response.role,
          address: response.address,
        },
        token: response.token,
        isLoading: false,
      });

      setupPushNotifications();

      return { success: true };
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || "Não foi possível criar a conta",
      });
      return { success: false };
    }
  },

  async logout() {
    await secureStorage.removeToken();
    set({ user: null, token: null });
  },

  async restoreSession() {
    const token = await secureStorage.getToken();
    if (!token) return null;

    set({ token, isLoading: true });

    try {
      const me = await authApi.getMe();

      if (me.role !== "BUSINESS_OWNER") {
        await secureStorage.removeToken();
        set({ token: null, user: null, isLoading: false });
        return null;
      }

      set({
        user: { name: me.name, role: me.role, address: me.address },
        isLoading: false,
      });

      setupPushNotifications();

      return token;
    } catch (err) {
      await secureStorage.removeToken();
      set({ token: null, user: null, isLoading: false });
      return null;
    }
  },
}));