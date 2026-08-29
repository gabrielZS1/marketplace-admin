import { useState } from "react";
import { Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Button from "../../components/ui/Button";
import LocationMap from "../../components/LocationMap";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

export default function LocationConfirmationScreen({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const businessId = useOnboardingStore((state) => state.businessId);

  const address = route?.params?.address;
  const number = route?.params?.number;
  const city = route?.params?.city;
  const state = route?.params?.state || "SP";
  const latitude = route?.params?.latitude;
  const longitude = route?.params?.longitude;

  async function handleContinue() {
    if (isLoading) return;
    if (!businessId || !latitude || !longitude) {
      setError("Endereço incompleto. Volte e selecione o endereço novamente.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onboardingApi.address(businessId, { address, number, city, state, latitude, longitude });
      navigation.navigate("TeamSize");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("LocationConfirmation")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="O pino está certo?"
      subtitle="É esse ponto que os clientes vão ver no mapa."
      footer={
        <Button
          title="Sim, confirmar"
          onPress={handleContinue}
          loading={isLoading}
        />
      }
    >
      <View className="mb-2 flex-1 overflow-hidden rounded-2xl">
        <LocationMap latitude={latitude} longitude={longitude} />
      </View>

      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <MapPin size={18} color="#111827" strokeWidth={2} />
        <View className="ml-3 flex-1">
          <Text numberOfLines={1} className="text-[14px] font-semibold text-[#111827]">
            {[address, number].filter(Boolean).join(", ")}
          </Text>
          <Text className="mt-0.5 text-[12px] text-gray-400">
            {[city, state].filter(Boolean).join(", ")}
          </Text>
        </View>
      </View>

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}
