import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { useState } from "react";

import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";

export default function LocationConfirmationScreen({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  const businessId = useOnboardingStore((state) => state.businessId);
  const [error, setError] = useState(null);

  // Endereço recebido da tela anterior
  const address = route?.params?.address;
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
    await onboardingApi.address(businessId, { address, city, state, latitude, longitude });
    navigation.navigate("TeamSize");
  } catch (err) {
    setError(err.message || "Não foi possível salvar. Tente novamente.");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <View className="flex-1 bg-white">
      {/* CONTEÚDO */}
      <View className="flex-1 px-4 pt-14">

        {/* VOLTAR + TÍTULO */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <ChevronLeft
              size={24}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <Text className="text-[13px] font-semibold text-black">
            O pino está no lugar certo, Gabriel?
          </Text>
        </View>

        {/* PROGRESSO */}
        <View className="mt-7 h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: "63%" }}
          />
        </View>

        {/* MAPA */}
        <View className="mt-7 h-[490px] overflow-hidden rounded-xl bg-[#d9d9d9]">

          {/* ENDEREÇO SOBRE O MAPA */}
          <View className="mx-5 mt-6 h-9 flex-row items-center rounded-md bg-white px-2">

            <View className="mr-2 h-7 w-7 items-center justify-center">
              <MapPin
                size={20}
                color="#cfcfcf"
                fill="#cfcfcf"
                strokeWidth={1.5}
              />
            </View>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-[8px] font-semibold text-gray-700"
              >
                {address}
              </Text>

              <Text className="mt-0.5 text-[6px] text-gray-400">
                {city}
              </Text>
            </View>
          </View>

        </View>

        {error ? (
          <Text className="mt-3 text-[9px] text-red-500">{error}</Text>
        ) : null}
      </View>

      {/* RODAPÉ */}
      <View className="px-4 pb-8">
        <TouchableOpacity
          disabled={isLoading}
          onPress={handleContinue}
          className="items-center rounded-xl bg-black py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}