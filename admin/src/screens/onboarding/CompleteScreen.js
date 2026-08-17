import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";

import { useBusinessStore } from "../../store/businessStore";
import { useAuthStore } from "../../store/authStore";

export default function CompleteScreen({ navigation }) {
  const businessId = useOnboardingStore((state) => state.businessId);
  const promoCode = useOnboardingStore((state) => state.promoCode);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [browserOpened, setBrowserOpened] = useState(false);
  const fetchBusinessStatus = useBusinessStore((state) => state.fetchStatus);

  const logout = useAuthStore((state) => state.logout);

  async function handleFinish() {
  if (isLoading) return;
  if (!businessId) {
    setError("Sessão de cadastro perdida. Volte ao início do cadastro.");
    return;
  }

  setError(null);
  setIsLoading(true);
  try {
    const result = await onboardingApi.complete(businessId, promoCode);
    const paymentUrl = result?.paymentUrl;

    if (!paymentUrl) {
      // Trial de 7 dias, sem código promocional — não precisa pagar agora
      setBrowserOpened(true);
      return;
    }

    if (!paymentUrl.startsWith("https://")) {
      setError("Não recebemos um link de pagamento válido. Tente novamente em instantes.");
      return;
    }

    await WebBrowser.openBrowserAsync(paymentUrl);
    setBrowserOpened(true);
  } catch (err) {
    setError(err.message || "Não foi possível iniciar o pagamento. Tente novamente.");
  } finally {
    setIsLoading(false);
  }
}

  if (browserOpened) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <CheckCircle2 size={48} color="#22c55e" />
        <Text className="mt-4 text-center text-[14px] font-semibold text-black">
          Cadastro enviado!
        </Text>
        <Text className="mt-2 text-center text-[10px] text-gray-500">
          Assim que o pagamento for confirmado pelo Mercado Pago, sua conta será ativada
          automaticamente. Isso pode levar alguns instantes.
        </Text>

        <TouchableOpacity
          onPress={fetchBusinessStatus}
          className="mt-6 rounded-xl bg-black px-6 py-3"
        >
          <Text className="text-[12px] font-semibold text-white">Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 pt-14">
      <Text className="text-[16px] font-semibold text-black">Quase lá!</Text>
      <Text className="mt-2 text-[10px] text-gray-500">
        Vamos abrir uma página segura do Mercado Pago pra você confirmar a assinatura do seu
        plano. Nenhum dado de cartão passa pelo nosso app.
      </Text>

      {promoCode ? (
        <Text className="mt-3 text-[10px] text-green-600">
          Código promocional aplicado: {promoCode}
        </Text>
      ) : null}

      {error ? (
        <Text className="mt-4 text-[10px] text-red-500">{error}</Text>
      ) : null}

      <TouchableOpacity
          onPress={handleFinish}
          disabled={isLoading}
          className="mt-6 items-center rounded-xl bg-black py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              Confirmar e continuar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => { await logout(); }}
          className="mt-3 items-center py-2"
        >
          <Text className="text-[11px] text-gray-400">Ir para login</Text>
        </TouchableOpacity>
    </View>
  );
}