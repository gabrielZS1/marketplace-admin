import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { subscriptionApi } from "../../api/subscriptionApi";
import { useAuthStore } from "../../store/authStore";

export default function TrialExpiredScreen({ businessId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const logout = useAuthStore((state) => state.logout);

  async function handleSubscribe() {
    if (isLoading) return;
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
    } catch (err) {
      setError(err.message || "Não foi possível iniciar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <AlertCircle size={48} color="#ef4444" />

      <Text className="mt-4 text-center text-[16px] font-semibold text-black">
        Seu período grátis acabou
      </Text>

      <Text className="mt-2 text-center text-[10px] text-gray-500">
        Assine agora pra continuar usando o app e atendendo seus clientes.
      </Text>

      {error ? (
        <Text className="mt-4 text-center text-[10px] text-red-500">{error}</Text>
      ) : null}

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleSubscribe}
        className="mt-6 items-center rounded-xl bg-black px-8 py-3"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-[13px] font-semibold text-white">Assinar agora</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} className="mt-4">
        <Text className="text-[10px] text-gray-400 underline">Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}