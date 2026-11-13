import { useCallback } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react-native";
import dayjs from "dayjs";

import { useBusinessStore } from "../../store/businessStore";
import { useSubscribe } from "../../hooks/useSubscribe";
import Screen from "../../components/ui/Screen";
import Button from "../../components/ui/Button";

function money(v) {
  if (v == null) return null;
  return `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
}
function daysLeft(d) {
  if (!d) return null;
  return Math.max(0, dayjs(d).startOf("day").diff(dayjs().startOf("day"), "day"));
}

export default function BillingScreen({ navigation }) {
  const status = useBusinessStore((s) => s.status);
  const fetchStatus = useBusinessStore((s) => s.fetchStatus);
  const { subscribe, refreshNow, isLoading, isConfirming, error } = useSubscribe(status?.id);

  useFocusEffect(
    useCallback(() => {
      fetchStatus().catch(() => {});
    }, [fetchStatus])
  );

  const st = status?.subscriptionStatus;
  const price = money(status?.monthlyPrice);
  const teamSize = status?.teamSize;

  const meta = {
    TRIAL: {
      Icon: Clock,
      color: "#111827",
      bg: "bg-gray-100",
      title: "Período de teste",
      line:
        daysLeft(status?.trialEndsAt) === 0
          ? "Termina hoje"
          : `${daysLeft(status?.trialEndsAt)} dias restantes`,
    },
    ACTIVE: {
      Icon: CheckCircle2,
      color: "#16A34A",
      bg: "bg-green-50",
      title: "Assinatura ativa",
      line: status?.currentPeriodEnd
        ? `Próxima cobrança em ${dayjs(status.currentPeriodEnd).format("DD/MM/YYYY")}`
        : "Em dia",
    },
    PAST_DUE: {
      Icon: AlertTriangle,
      color: "#B45309",
      bg: "bg-amber-50",
      title: "Pagamento pendente",
      line: status?.graceEndsAt
        ? `Regularize até ${dayjs(status.graceEndsAt).format("DD/MM/YYYY")}`
        : "Regularize para continuar",
    },
  }[st] || {
    Icon: Clock,
    color: "#111827",
    bg: "bg-gray-100",
    title: "Assinatura",
    line: "—",
  };

  const showSubscribe = st === "TRIAL" || st === "PAST_DUE";
  const busy = isLoading || isConfirming;

  return (
    <Screen navigation={navigation} title="Plano e cobrança">
      {/* STATUS */}
      <View className={`flex-row items-center rounded-2xl ${meta.bg} px-4 py-4`}>
        <meta.Icon size={22} color={meta.color} strokeWidth={2} />
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold" style={{ color: meta.color }}>
            {meta.title}
          </Text>
          <Text className="mt-0.5 text-[12px] text-gray-500">{meta.line}</Text>
        </View>
      </View>

      {/* PLANO */}
      <View className="mt-4 rounded-2xl border border-gray-200 px-4 py-4">
        <Text className="text-[12px] text-gray-400">
          {teamSize === 1 ? "Plano individual" : `Plano · ${teamSize || "?"} profissionais`}
        </Text>
        <Text className="mt-1 text-2xl font-bold text-[#111827]">
          {price || "—"}
          <Text className="text-[13px] font-normal text-gray-400"> / mês</Text>
        </Text>
        <Text className="mt-2 text-[12px] leading-4 text-gray-400">
          O valor acompanha a quantidade de profissionais da sua equipe.
        </Text>
      </View>

      {st === "TRIAL" || st === "ACTIVE" || st === "PAST_DUE" ? (
        <View className="mt-3">
          <Button
            title="Trocar plano"
            variant="outline"
            onPress={() => navigation.navigate("ChangePlan")}
          />
        </View>
      ) : null}

      {error ? (
        <Text className="mt-4 text-[13px] text-red-600">{error}</Text>
      ) : null}

      <Text className="mt-5 text-[12px] leading-4 text-gray-400">
        O pagamento é processado pelo Mercado Pago. Nenhum dado de cartão passa pelo app.
        Cancelamentos e recibos ficam na sua conta do Mercado Pago.
      </Text>

      {showSubscribe ? (
        <View className="mt-5">
          <Button
            title={
              isConfirming
                ? "Confirmando pagamento…"
                : st === "PAST_DUE"
                ? "Regularizar pagamento"
                : "Assinar agora"
            }
            onPress={subscribe}
            loading={busy}
          />
          <View className="mt-2">
            <Button title="Já paguei · atualizar" variant="ghost" onPress={refreshNow} />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
