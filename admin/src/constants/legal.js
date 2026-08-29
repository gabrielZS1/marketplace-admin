import { apiClient } from "../api/client";
import * as WebBrowser from "expo-web-browser";

// Origem da API (sem o /api). Ex.: "http://192.168.15.27:8082"
const ORIGIN = (apiClient.defaults.baseURL || "").replace(/\/api\/?$/, "");

export const LEGAL_URLS = {
  terms: ORIGIN ? `${ORIGIN}/legal/termos` : "",
  privacy: ORIGIN ? `${ORIGIN}/legal/privacidade` : "",
};

export function openLegal(kind) {
  const url = LEGAL_URLS[kind];
  if (!url) return;
  WebBrowser.openBrowserAsync(url).catch(() => {});
}
