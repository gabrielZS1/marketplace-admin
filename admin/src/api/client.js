import axios from "axios";
import { secureStorage } from "../utils/secureStorage";

// Definido em .env como EXPO_PUBLIC_API_URL (Expo injeta no build).
// Fallback = backend de staging no Render.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://glowly-backend-fkqe.onrender.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  // Render free hiberna após 15 min → 1ª requisição pode levar ~50s.
  timeout: 60000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    // Assinatura bloqueada (trial expirado / pagamento suspenso):
    // trava o app e manda pra tela de renovação.
    if (error.response?.status === 403 && data?.error === "SUBSCRIPTION_BLOCKED") {
      import("../store/businessStore")
        .then(({ useBusinessStore }) => {
          useBusinessStore.getState().applyBlock(data.reason);
        })
        .catch(() => {});
    }

    // Senha temporária ainda não trocada: o app mostra a tela de troca de senha.
    if (error.response?.status === 403 && data?.error === "PASSWORD_CHANGE_REQUIRED") {
      import("../store/authStore")
        .then(({ useAuthStore }) => {
          useAuthStore.getState().requirePasswordChange();
        })
        .catch(() => {});
    }

    const message = data?.message || "Erro de conexão. Tente novamente.";
    return Promise.reject({ ...error, message });
  }
);
