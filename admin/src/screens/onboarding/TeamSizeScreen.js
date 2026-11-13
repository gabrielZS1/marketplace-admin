import { useState } from "react";
import { Text, View } from "react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import OptionCard from "../../components/ui/OptionCard";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";
import { TEAM_SIZES } from "../../constants/plans";
import { IN_APP_BILLING } from "../../constants/billing";

export default function TeamSizeScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const businessId = useOnboardingStore((state) => state.businessId);

  async function handleContinue() {
    if (!selected || isLoading) return;
    if (!businessId) {
      setError("Sessão de cadastro perdida. Volte e selecione a categoria novamente.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onboardingApi.teamSize(businessId, selected);
      navigation.navigate("WorkingHours");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  const chosen = TEAM_SIZES.find((t) => t.value === selected);

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("TeamSize")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Qual o tamanho da sua equipe?"
      subtitle={
        IN_APP_BILLING
          ? "A mensalidade depende do número de profissionais."
          : "Escolha quantos profissionais atendem no seu estabelecimento."
      }
      footer={
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!selected}
        />
      }
    >
      {TEAM_SIZES.map((item) => (
        <OptionCard
          key={item.value}
          title={item.label}
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
      ))}

      <View className="mt-2 rounded-2xl bg-[#F5F6F8] px-4 py-3">
        <Text className="text-[12px] leading-4 text-gray-500">
          {IN_APP_BILLING
            ? chosen
              ? `Após o período de teste: R$ ${chosen.price},00 por mês. Você só paga quando o teste acabar.`
              : "Você tem um período de teste gratuito antes de qualquer cobrança."
            : "Você começa com um período de teste gratuito. Dá para mudar o plano depois."}
        </Text>
      </View>

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}
