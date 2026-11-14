import { create } from "zustand";
import { authApi } from "../api/authApi";
import { apiClient } from "../api/client";
import { secureStorage } from "../utils/secureStorage";
import { signInWithGoogle } from "../services/googleSignIn";
import { registerForPushNotificationsAsync } from "../../pushNotifications";
import { getNotificationsEnabled } from "../utils/notificationPref";
import logger from "../utils/logger";

const ALLOWED_ROLES = ["BUSINESS_OWNER", "EMPLOYEE"];

export async function setupPushNotifications() {
  try {
    if (!(await getNotificationsEnabled())) return;

    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    try {
      await apiClient.patch("/businesses/me/push-token", {
        expoPushToken: token,
      });
    } catch (err) {
      // Dono recém-cadastrado ainda não tem estabelecimento (onboarding pendente).
      // Não é erro — o token é registrado de novo quando o negócio existir.
      if (err?.response?.status === 404) return;
      logger.warn("Não foi possível registrar o token de push:", err?.message);
    }
  } catch (err) {
    logger.warn("Push notifications indisponíveis:", err?.message);
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

      if (!ALLOWED_ROLES.includes(response.role)) {
        set({
          isLoading: false,
          error: "Esta conta não tem acesso a este app. Use o app do cliente.",
        });
        return { success: false };
      }

      await secureStorage.saveToken(response.token);
      set({
        user: {
          name: response.name,
          email: response.email,
          role: response.role,
          address: response.address,
          emailVerified: response.emailVerified,
          mustChangePassword: !!response.mustChangePassword,
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

  async loginWithGoogle() {
    set({ isLoading: true, error: null });
    try {
      const google = await signInWithGoogle();

      // Usuário cancelou o popup do Google — não é erro.
      if (!google) {
        set({ isLoading: false });
        return { success: false, cancelled: true };
      }

      const response = await authApi.loginWithGoogle({ idToken: google.idToken });

      if (!ALLOWED_ROLES.includes(response.role)) {
        set({
          isLoading: false,
          error: "Esta conta não tem acesso a este app. Use o app do cliente.",
        });
        return { success: false };
      }

      await secureStorage.saveToken(response.token);
      set({
        user: {
          name: response.name,
          email: response.email,
          role: response.role,
          address: response.address,
          emailVerified: response.emailVerified,
          mustChangePassword: !!response.mustChangePassword,
        },
        token: response.token,
        isLoading: false,
      });

      setupPushNotifications();

      return { success: true };
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || "Não foi possível entrar com o Google.",
      });
      return { success: false };
    }
  },

  async registerBusinessOwner({ name, email, phone, password, acceptedTerms, captchaToken }) {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.registerBusinessOwner({
        name,
        email,
        phone,
        password,
        acceptedTerms,
        captchaToken,
      });

      await secureStorage.saveToken(response.token);
      set({
        user: {
          name: response.name,
          email: response.email,
          role: response.role,
          address: response.address,
          emailVerified: response.emailVerified,
          mustChangePassword: !!response.mustChangePassword,
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

  async verifyEmail(code) {
    await authApi.verifyEmail({ code });
    set((state) => ({
      user: state.user ? { ...state.user, emailVerified: true } : state.user,
    }));
  },

  async resendVerification() {
    await authApi.resendVerification();
  },

  // Funcionário entrou com a senha criada pelo dono: troca agora e libera o app.
  async changeTemporaryPassword(currentPassword, newPassword) {
    await authApi.changePassword({ currentPassword, newPassword });
    set((state) => ({
      user: state.user ? { ...state.user, mustChangePassword: false } : state.user,
    }));
  },

  // O servidor recusou uma chamada porque a senha ainda é temporária (ex.: sessão antiga).
  requirePasswordChange() {
    set((state) => ({
      user: state.user ? { ...state.user, mustChangePassword: true } : state.user,
    }));
  },

  async logout() {
    await secureStorage.removeToken();
    set({ user: null, token: null });
  },

  async deleteAccount(password) {
    await authApi.deleteAccount({ password });
    await secureStorage.removeToken();
    set({ user: null, token: null });
  },

  async restoreSession() {
    const token = await secureStorage.getToken();
    if (!token) return null;

    set({ token, isLoading: true });

    try {
      const me = await authApi.getMe();

      if (!ALLOWED_ROLES.includes(me.role)) {
        await secureStorage.removeToken();
        set({ token: null, user: null, isLoading: false });
        return null;
      }

      set({
        user: {
          name: me.name,
          email: me.email,
          role: me.role,
          address: me.address,
          emailVerified: me.emailVerified,
          mustChangePassword: !!me.mustChangePassword,
        },
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