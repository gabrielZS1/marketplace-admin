import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, PartyPopper, MailWarning } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import { useBusinessStore } from "../../store/businessStore";
import { useAuthStore, setupPushNotifications } from "../../store/authStore";
import Button from "../../components/ui/Button";

export default function CompleteScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const businessId = useOnboardingStore((state) => state.businessId);
  const promoCode = useOnboardingStore((state) => state.promoCode);
  const resetOnboarding = useOnboardingStore((state) => state.reset);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const fetchBusinessStatus = useBusinessStore((state) => state.fetchStatus);
  const logout = useAuthStore((state) => state.logout);
  const emailVerified = useAuthStore((state) => state.user?.emailVerified);

  async function handleFinish() {
    if (isLoading) return;
    if (!businessId) {
      setError("Sessão de cadastro perdida. Volte ao início do cadastro.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onboardingApi.complete(businessId, promoCode);
      setDone(true);
    } catch (err) {
      setError(err.message || "Não foi possível finalizar o cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnter() {
    setIsLoading(true);
    try {
      await fetchBusinessStatus();
      // Agora que o estabelecimento existe, registra o token de push.
      setupPushNotifications();
      resetOnboarding();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
    >
      <View className="flex-1 items-center justify-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F5F6F8]">
          {done ? (
            <CheckCircle2 size={30} color="#16A34A" strokeWidth={2} />
          ) : (
            <PartyPopper size={28} color="#111827" strokeWidth={2} />
          )}
        </View>

        <Text className="mt-5 text-center text-2xl font-bold text-[#111827]">
          {done ? "Tudo pronto!" : "Falta só um passo"}
        </Text>

        <Text className="mt-2 text-center text-[13px] leading-5 text-gray-500">
          {done
            ? "Seu período de teste está ativo. Configure seus serviços e sua agenda — a cobrança só começa quando o teste acabar."
            : "Vamos finalizar seu cadastro e liberar o período de teste gratuito."}
        </Text>

        {promoCode && !done ? (
          <View className="mt-4 rounded-full bg-[#F5F6F8] px-4 py-2">
            <Text className="text-[12px] font-semibold text-[#111827]">
              Código {promoCode} aplicado
            </Text>
          </View>
        ) : null}

        {error ? (
          <Text className="mt-4 text-center text-[13px] text-red-600">{error}</Text>
        ) : null}

        {!done && emailVerified === false ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("VerifyEmail")}
            className="mt-5 flex-row items-center rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3"
          >
            <MailWarning size={16} color="#B45309" strokeWidth={2} />
            <Text className="ml-2 flex-1 text-[12px] leading-4 text-[#78350F]">
              Confirme seu e-mail para não perder o acesso à conta.
            </Text>
            <Text className="ml-2 text-[12px] font-semibold text-[#B45309]">
              Confirmar
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View>
        <Button
          title={done ? "Entrar no app" : "Finalizar cadastro"}
          onPress={done ? handleEnter : handleFinish}
          loading={isLoading}
        />
        {!done ? (
          <TouchableOpacity
            onPress={async () => {
              await logout();
            }}
            className="mt-2 h-11 items-center justify-center"
          >
            <Text className="text-[14px] font-medium text-gray-500">Sair</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
