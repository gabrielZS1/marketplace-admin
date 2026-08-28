import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MapPin, Search } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Button from "../../components/ui/Button";
import LocationMap from "../../components/LocationMap";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

export default function AddressScreen({ navigation }) {
  const selectedAddress = useOnboardingStore((state) => state.selectedAddress);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = !!selectedAddress;

  function handleContinue() {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    navigation.navigate("AddressConfirmation", {
      address: selectedAddress.address,
      city: selectedAddress.city,
      state: selectedAddress.state,
      cep: selectedAddress.cep,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    });
    setIsLoading(false);
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("Address")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Onde os clientes te encontram?"
      subtitle="Busque o endereço e confirme o ponto no mapa."
      footer={
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!isValid}
        />
      }
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("AddressSearch")}
        className="mb-4 h-14 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4"
      >
        <Search size={18} color="#9CA3AF" strokeWidth={2} />
        <Text
          numberOfLines={1}
          className={`ml-3 flex-1 text-[15px] ${
            selectedAddress ? "font-medium text-[#111827]" : "text-gray-400"
          }`}
        >
          {selectedAddress?.title || "Buscar endereço"}
        </Text>
      </TouchableOpacity>

      <View className="mb-2 flex-1 overflow-hidden rounded-2xl">
        <LocationMap
          latitude={selectedAddress?.latitude}
          longitude={selectedAddress?.longitude}
        />
      </View>

      {!isValid && (
        <View className="flex-row items-center justify-center py-1">
          <MapPin size={13} color="#9CA3AF" strokeWidth={2} />
          <Text className="ml-1.5 text-[12px] text-gray-400">
            Busque um endereço para continuar
          </Text>
        </View>
      )}
    </OnboardingScreen>
  );
}
