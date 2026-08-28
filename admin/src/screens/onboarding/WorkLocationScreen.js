import { useState } from "react";
import { Text } from "react-native";
import { Store, Home } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import OptionCard from "../../components/ui/OptionCard";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

const WORK_LOCATIONS = [
  {
    value: "AT_BUSINESS",
    title: "No meu estabelecimento",
    description:
      "Os clientes vão até o seu local — salão próprio, sala alugada ou espaço compartilhado.",
    Icon: Store,
  },
  {
    value: "AT_CLIENT_HOME",
    title: "Na casa do cliente",
    description: "Você atende no endereço do cliente.",
    Icon: Home,
  },
];

export default function WorkLocationScreen({ navigation }) {
  const [selected, setSelected] = useState("AT_BUSINESS");
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
      await onboardingApi.workLocation(businessId, selected);
      navigation.navigate("Address");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("WorkLocation")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Onde você atende?"
      subtitle="Isso define como os clientes agendam com você."
      footer={
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!selected}
        />
      }
    >
      {WORK_LOCATIONS.map((loc) => {
        const isSelected = selected === loc.value;
        return (
          <OptionCard
            key={loc.value}
            title={loc.title}
            description={loc.description}
            selected={isSelected}
            onPress={() => setSelected(loc.value)}
            control="radio"
            icon={
              <loc.Icon
                size={20}
                color={isSelected ? "#111827" : "#9CA3AF"}
                strokeWidth={2}
              />
            }
          />
        );
      })}

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}
