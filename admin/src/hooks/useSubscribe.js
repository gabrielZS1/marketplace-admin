import { useEffect, useRef, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { subscriptionApi } from "../api/subscriptionApi";
import { useBusinessStore } from "../store/businessStore";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

/**
 * Fluxo de assinatura reaproveitado pela tela de renovação e pelo banner de trial:
 *  1. POST /businesses/{id}/subscribe -> paymentUrl
 *  2. abre o checkout do Mercado Pago no navegador
 *  3. quando o navegador fecha, fica dando polling em /businesses/me
 *     até o status virar ACTIVE (webhook confirmou o pagamento)
 */
export function useSubscribe(businessId) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const pollTimer = useRef(null);

  const fetchStatus = useBusinessStore((s) => s.fetchStatus);

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setIsConfirming(false);
  }

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  async function pollUntilActive() {
    setIsConfirming(true);
    const startedAt = Date.now();

    pollTimer.current = setInterval(async () => {
      try {
        const status = await fetchStatus();
        if (status?.active === true && status?.subscriptionStatus === "ACTIVE") {
          stopPolling();
          return;
        }
      } catch {
        // ignora erros pontuais de rede durante o polling
      }

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
        setError(
          "Ainda não recebemos a confirmação do pagamento. Se você já pagou, toque em \"Já paguei\"."
        );
      }
    }, POLL_INTERVAL_MS);
  }

  async function subscribe() {
    if (isLoading || isConfirming) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await subscriptionApi.subscribeNow(businessId);
      const paymentUrl = result?.paymentUrl;

      if (!paymentUrl || !paymentUrl.startsWith("https://")) {
        setError("Não recebemos um link de pagamento válido. Tente novamente.");
        return;
      }

      await WebBrowser.openBrowserAsync(paymentUrl);
      // navegador fechou -> começa a confirmar
      await pollUntilActive();
    } catch (err) {
      setError(err.message || "Não foi possível iniciar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  }

  // Botão "Já paguei / Atualizar"
  async function refreshNow() {
    setError(null);
    try {
      await fetchStatus();
    } catch {
      setError("Não foi possível atualizar. Verifique sua conexão.");
    }
  }

  return { subscribe, refreshNow, stopPolling, isLoading, isConfirming, error };
}
