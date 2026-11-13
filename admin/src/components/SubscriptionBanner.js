import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, AlertTriangle } from "lucide-react-native";
import dayjs from "dayjs";
import { useBusinessStore } from "../store/businessStore";
import { useSubscribe } from "../hooks/useSubscribe";
import { IN_APP_BILLING } from "../constants/billing";

function daysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = dayjs(dateStr).startOf("day").diff(dayjs().startOf("day"), "day");
  return Math.max(0, diff);
}

/**
 * Faixa fina acima das abas:
 *  - TRIAL    -> lembrete calmo com contagem regressiva
 *  - PAST_DUE -> aviso (tom âmbar) de pagamento pendente
 */
export default function SubscriptionBanner() {
  const insets = useSafeAreaInsets();
  const status = useBusinessStore((s) => s.status);
  const { subscribe, isLoading, isConfirming } = useSubscribe(status?.id);

  if (!status || status.active === false) return null;

  const st = status.subscriptionStatus;
  if (st !== "TRIAL" && st !== "PAST_DUE") return null;

  const isTrial = st === "TRIAL";
  const left = daysLeft(isTrial ? status.trialEndsAt : status.graceEndsAt);
  const busy = isLoading || isConfirming;

  const theme = isTrial
    ? { bg: "#ffffff", border: "#e5e7eb", text: "#374151", accent: "#111827", Icon: Clock }
    : { bg: "#fffbeb", border: "#fde68a", text: "#78350f", accent: "#b45309", Icon: AlertTriangle };

  const label = isTrial
    ? left === 0
      ? "Seu teste grátis termina hoje"
      : `Teste grátis · ${left} ${left === 1 ? "dia restante" : "dias restantes"}`
    : left === 0
    ? "Pagamento pendente · regularize hoje"
    : `Pagamento pendente · ${left} ${left === 1 ? "dia" : "dias"} para regularizar`;

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 8,
        backgroundColor: theme.bg,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
      className="flex-row items-center px-4"
    >
      <theme.Icon size={14} color={theme.accent} strokeWidth={2} />

      <Text
        numberOfLines={1}
        style={{ color: theme.text }}
        className="ml-2 flex-1 text-[13px]"
      >
        {label}
      </Text>

      {IN_APP_BILLING ? (
        <TouchableOpacity
          onPress={subscribe}
          disabled={busy}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="ml-3"
        >
          {busy ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <Text style={{ color: theme.accent }} className="text-[13px] font-semibold">
              {isTrial ? "Assinar" : "Regularizar"}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
