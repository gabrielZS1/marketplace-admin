import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useBusinessStore } from "../../store/businessStore";
import { subscriptionApi } from "../../api/subscriptionApi";
import { getEmployees } from "../../api/employeeApi";
import { TEAM_SIZES, formatPlanPrice } from "../../constants/plans";
import Screen from "../../components/ui/Screen";
import OptionCard from "../../components/ui/OptionCard";
import Button from "../../components/ui/Button";

export default function ChangePlanScreen({ navigation }) {
  const status = useBusinessStore((s) => s.status);
  const fetchStatus = useBusinessStore((s) => s.fetchStatus);

  const businessId = status?.id;
  const currentSize = status?.teamSize ?? 1;
  const subscriptionStatus = status?.subscriptionStatus;

  const [selected, setSelected] = useState(null);
  const [activeCount, setActiveCount] = useState(0);
  const [saving, setSaving] = useState(false);

  // Quantos profissionais ativos existem: não dá pra escolher um plano menor que isso.
  useFocusEffect(
    useCallback(() => {
      if (!businessId) return;
      getEmployees(businessId)
        .then((list) => setActiveCount(Array.isArray(list) ? list.length : 0))
        .catch(() => setActiveCount(0));
    }, [businessId])
  );

  const current = TEAM_SIZES.find((t) => t.value === currentSize);
  const chosen = TEAM_SIZES.find((t) => t.value === selected);
  const isUpgrade = chosen && chosen.value > currentSize;

  const isTrial = subscriptionStatus === "TRIAL";
  const effectNote = isTrial
    ? "Você está no período de teste. O novo valor passa a valer quando você assinar."
    : "O novo valor vale a partir da próxima cobrança. O limite de profissionais muda agora.";

  function confirm() {
    if (!chosen || saving) return;

    Alert.alert(
      isUpgrade ? "Aumentar plano" : "Reduzir plano",
      `Mudar de "${current?.label}" para "${chosen.label}"?\n\nNovo valor: ${formatPlanPrice(
        chosen.price
      )} por mês.\n\n${effectNote}`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: submit },
      ]
    );
  }

  async function submit() {
    if (!chosen || saving || !businessId) return;
    setSaving(true);
    try {
      await subscriptionApi.changePlan(businessId, chosen.value);
      await fetchStatus().catch(() => {});
      Alert.alert("Plano atualizado", `Seu plano agora é "${chosen.label}".`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Não foi possível trocar o plano", err?.message || "Tente novamente em instantes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      navigation={navigation}
      title="Trocar plano"
      subtitle="A mensalidade depende do número de profissionais da sua equipe."
      footer={
        <Button
          title={chosen ? `Mudar para ${chosen.label}` : "Escolha um plano"}
          onPress={confirm}
          loading={saving}
          disabled={!chosen}
        />
      }
    >
      {TEAM_SIZES.map((item) => {
        const isCurrent = item.value === currentSize;
        const tooSmall = item.value < activeCount;
        const disabled = isCurrent || tooSmall;

        let description = `${formatPlanPrice(item.price)} por mês`;
        if (isCurrent) description = `Seu plano atual · ${description}`;
        else if (tooSmall) {
          description = `Você tem ${activeCount} profissionais ativos — desative alguns antes de escolher este plano.`;
        }

        return (
          <View key={item.value} style={{ opacity: disabled ? 0.5 : 1 }} pointerEvents={disabled ? "none" : "auto"}>
            <OptionCard
              title={item.label}
              description={description}
              selected={selected === item.value}
              onPress={() => setSelected(item.value)}
              control="radio"
              icon={
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Text className="text-[15px] font-bold text-gray-600">
                    {item.value === 5 ? "5+" : item.value}
                  </Text>
                </View>
              }
            />
          </View>
        );
      })}

      <View className="mt-2 rounded-2xl bg-[#F5F6F8] px-4 py-3">
        <Text className="text-[12px] leading-4 text-gray-500">{effectNote}</Text>
      </View>
    </Screen>
  );
}
