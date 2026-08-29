import { apiClient } from "../api/client";

// Origem da API (sem o /api final). Ex.: "http://192.168.15.27:8082"
const API_ORIGIN = (apiClient.defaults.baseURL || "").replace(/\/api\/?$/, "");

/**
 * O backend monta as URLs de /uploads com o host do APP_BASE_URL, que nem sempre
 * bate com o host que o app usa (ex.: "localhost" gravado, mas o celular acessa
 * pelo IP da rede). Aqui reescrevemos a origem de qualquer URL /uploads para a
 * mesma origem da API — assim a foto carrega desde que o backend esteja acessível.
 */
export function mediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  const match = /^https?:\/\/[^/]+(\/uploads\/.*)$/i.exec(url);
  if (match && API_ORIGIN) return API_ORIGIN + match[1];
  return url;
}
