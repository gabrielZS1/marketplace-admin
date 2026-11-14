import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Lock } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import { useSubscribe } from "../../hooks/useSubscribe";
import Button from "../../components/ui/Button";
import { IN_APP_BILLING } from "../../constants/billing";

function formatPrice(value) {
  if (value == null) return null;
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

export default function TrialExpiredScreen({ status }) {
  const insets = useSafeAreaInsets();
  const businessId = status?.id;
  const reason = status?.blockReason || "TRIAL_EXPIRED";
  const isEmployee = status?.role === "EMPLOYEE";
  const price = formatPrice(status?.monthlyPrice);
  const teamSize = status?.teamSize;

  const logout = useAuthStore((state) => state.logout);
  const { subscribe, refreshNow, isLoading, isConfirming, error } =
    useSubscribe(businessId);

  // "Atualizar" só consulta o status de novo. Se continuar bloqueado, esta tela segue aqui —
  // então avisamos, em vez de parecer que o botão não fez nada.
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setNotice(null);
    try {
      await refreshNow();
      // Se a assinatura voltou a ficar ativa, esta tela é trocada pelo app e nada abaixo aparece.
      setNotice(
        isModeration
          ? "O estabelecimento continua suspenso."
          : "Sua assinatura ainda não está ativa. Se você já regularizou, aguarde alguns instantes e toque em Atualizar de novo."
      );
    } finally {
      setRefreshing(false);
    }
  }

  // Suspenso pela moderação (denúncia aceita): pagar não resolve, então não oferecemos assinar.
  const isModeration = reason === "MODERATION_SUSPENDED";

  const title = isModeration
    ? "Estabelecimento suspenso"
    : isEmployee
    ? "Estabelecimento com pendência"
    : reason === "PAYMENT_FAILED"
    ? "Assinatura suspensa"
    : "Seu período de teste acabou";

  const subtitle = isModeration
    ? isEmployee
      ? "O estabelecimento foi suspenso após uma análise de denúncia. Fale com o responsável."
      : "Seu estabelecimento foi suspenso após uma análise de denúncia e não aparece para os clientes. Responda o e-mail de suporte do Glowly para pedir uma revisão."
    : isEmployee
    ? "A assinatura do estabelecimento está com uma pendência. Avise o responsável para regularizar."
    : !IN_APP_BILLING
    ? "Sua assinatura não está ativa. Enviamos as instruções para o e-mail da sua conta; depois de regularizar, toque em \"Atualizar\"."
    : reason === "PAYMENT_FAILED"
    ? "Não conseguimos renovar seu pagamento. Regularize para voltar a usar o app."
    : "Assine para continuar gerenciando sua agenda e seus clientes.";

  return (
    <View
      className="flex-1 bg-white px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
    >
      <View className="flex-1 items-center justify-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F5F6F8]">
          <Lock size={26} color="#111827" strokeWidth={2} />
        </View>

        <Text className="mt-5 text-center text-2xl font-bold text-[#111827]">
          {title}
        </Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-gray-500">
          {subtitle}
        </Text>
        <Text className="mt-3 text-center text-[12px] text-gray-400">
          Seus dados continuam salvos.
        </Text>

        {IN_APP_BILLING && price && !isEmployee && !isModeration ? (
          <View className="mt-6 w-full rounded-2xl border border-gray-200 px-5 py-4">
            <Text className="text-[12px] text-gray-400">
              {teamSize === 1 ? "Plano individual" : `Plano · ${teamSize} profissionais`}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-[#111827]">
              {price}
              <Text className="text-[13px] font-normal text-gray-400"> / mês</Text>
            </Text>
          </View>
        ) : null}

        {error && !isEmployee ? (
          <Text className="mt-4 text-center text-[13px] text-red-600">{error}</Text>
        ) : null}

        {notice && !error ? (
          <Text className="mt-4 text-center text-[13px] leading-5 text-gray-500">{notice}</Text>
        ) : null}
      </View>

      <View>
        {!isEmployee && !isModeration && IN_APP_BILLING ? (
          <>
            <Button
              title={isConfirming ? "Confirmando pagamento…" : "Assinar agora"}
              onPress={subscribe}
              loading={isLoading || isConfirming}
            />
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isLoading || refreshing}
              className="mt-2 h-11 items-center justify-center"
            >
              {refreshing ? (
                <ActivityIndicator color="#6B7280" />
              ) : (
                <Text className="text-[14px] font-medium text-gray-500">Já paguei · atualizar</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoading || refreshing}
            className="h-12 items-center justify-center rounded-2xl border border-gray-300"
          >
            {refreshing ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text className="text-[14px] font-semibold text-[#111827]">Atualizar</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={logout} className="mt-2 h-9 items-center justify-center">
          <Text className="text-[13px] text-gray-400">Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
