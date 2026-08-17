import axios from "axios";
import { secureStorage } from "../utils/secureStorage";

// Troque pelo IP da sua máquina na rede local quando testar no celular físico
// (localhost não funciona em dispositivo físico, só no emulador Android com 10.0.2.2)
const BASE_URL = "http://192.168.15.27:8082/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();

  console.log("TOKEN ENCONTRADO:", token ? "SIM" : "NÃO");
  console.log("REQUISIÇÃO:", config.method?.toUpperCase(), config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Erro de conexão. Tente novamente.";
    return Promise.reject({ ...error, message });
  }
);