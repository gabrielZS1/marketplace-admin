import { useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  Scissors,
  Hand,
  Sparkles,
  Eye,
  Droplet,
  HeartPulse,
  Flower2,
  Palette,
  LayoutGrid,
} from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { useAuthStore } from "../../store/authStore";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import OptionCard from "../../components/ui/OptionCard";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

const MAIN_CATEGORIES = [
  { value: "BARBERSHOP", label: "Barbearia", Icon: Scissors },
  { value: "MANICURE", label: "Manicure", Icon: Hand },
  { value: "HAIRDRESSER", label: "Cabeleireiro", Icon: Sparkles },
  { value: "EYEBROWS_LASHES", label: "Sobrancelhas e cílios", Icon: Eye },
  { value: "SKINCARE", label: "Cuidados com a pele", Icon: Droplet },
  { value: "WELLNESS", label: "Saúde e bem-estar", Icon: HeartPulse },
];

const OTHER_CATEGORIES = [
  { value: "SPA", label: "SPA", Icon: Flower2 },
  { value: "MAKEUP", label: "Maquiagem", Icon: Palette },
  { value: "OTHER", label: "Outros", Icon: LayoutGrid },
];

function CategoryIcon({ Icon, selected }) {
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-xl ${
        selected ? "bg-[#111827]" : "bg-gray-100"
      }`}
    >
      <Icon size={18} color={selected ? "#fff" : "#6B7280"} strokeWidth={2} />
    </View>
  );
}

export default function CategoryScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const selectCategory = useOnboardingStore((state) => state.selectCategory);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const error = useOnboardingStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);

  function handleBack() {
    Alert.alert(
      "Sair do cadastro",
      "Você ainda não terminou de cadastrar seu estabelecimento. Deseja sair da conta?",
      [
        { text: "Continuar cadastro", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => logout() },
      ],
    );
  }

  async function handleContinue() {
    if (!selected) return;
    const result = await selectCategory(selected);
    if (result.success) {
      navigation.navigate("BasicInfo");
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      onBack={handleBack}
      step={stepIndex("Category")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Qual é o ramo da sua empresa?"
      subtitle="Escolha a categoria que melhor representa o seu trabalho."
      scroll
      footer={
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!selected}
        />
      }
    >
      {MAIN_CATEGORIES.map((cat) => (
        <OptionCard
          key={cat.value}
          title={cat.label}
          selected={selected === cat.value}
          onPress={() => setSelected(cat.value)}
          control="radio"
          icon={<CategoryIcon Icon={cat.Icon} selected={selected === cat.value} />}
        />
      ))}

      <Text className="mb-3 mt-4 text-[12px] font-medium uppercase tracking-wide text-gray-400">
        Outras categorias
      </Text>

      {OTHER_CATEGORIES.map((cat) => (
        <OptionCard
          key={cat.value}
          title={cat.label}
          selected={selected === cat.value}
          onPress={() => setSelected(cat.value)}
          control="radio"
          icon={<CategoryIcon Icon={cat.Icon} selected={selected === cat.value} />}
        />
      ))}

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}
