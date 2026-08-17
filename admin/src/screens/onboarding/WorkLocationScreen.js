import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, Check } from "lucide-react-native";

import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";

const WORK_LOCATIONS = [
  {
    value: "AT_BUSINESS",
    title: "No meu estabelecimento",
    description:
      "Os clientes vão até o estabelecimento, que pode ser o seu próprio local, um salão ou uma sala onde outros profissionais trabalham.",
  },
  {
    value: "AT_CLIENT_HOME",
    title: "Na casa do cliente",
    description:
      "Os serviços são feitos diretamente na casa do cliente.",
  },
];

export default function WorkLocationScreen({ navigation }) {
  const [selected, setSelected] = useState("AT_BUSINESS");
  const [isLoading, setIsLoading] = useState(false);
  const businessId = useOnboardingStore((state) => state.businessId);
  const [error, setError] = useState(null);

  function handleSelect(value) {
    setSelected(value);
  }

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
    <View className="flex-1 bg-white">

      {/* CONTEÚDO */}
      <View className="flex-1 px-4 pt-14">

        {/* VOLTAR */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-7"
        >
          <ChevronLeft
            size={24}
            color="#000"
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* PROGRESSO */}
        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: "47%" }}
          />
        </View>

        {/* TÍTULO */}
        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">
            Onde você trabalha, Gabriel?
          </Text>
        </View>

        {/* OPÇÕES */}
        <View className="mt-5">

          {WORK_LOCATIONS.map((location, index) => {
            const isSelected = selected === location.value;

            return (
              <TouchableOpacity
                key={location.value}
                activeOpacity={0.7}
                onPress={() => handleSelect(location.value)}
                className={`flex-row px-1 ${
                  index === 0
                    ? "pb-5"
                    : "border-t border-gray-100 pt-3"
                }`}
              >

                {/* CHECKBOX */}
                <View
                  className={`mt-0.5 h-5 w-5 items-center justify-center rounded-[5px] border ${
                    isSelected
                      ? "border-black bg-black"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      color="#fff"
                      strokeWidth={2.5}
                    />
                  )}
                </View>

                {/* TEXTO */}
                <View className="ml-2.5 flex-1">

                  <Text
                    className={`text-[9px] font-semibold ${
                      isSelected
                        ? "text-black"
                        : "text-gray-700"
                    }`}
                  >
                    {location.title}
                  </Text>

                  <Text className="mt-1 pr-3 text-[7px] leading-[9px] text-gray-400">
                    {location.description}
                  </Text>

                </View>
              </TouchableOpacity>
            );
          })}

        </View>

        {error ? (
          <Text className="mt-4 text-[9px] text-red-500">{error}</Text>
        ) : null}
      </View>

      {/* BOTÃO */}
      <View className="px-4 pb-8 pt-4">
        <TouchableOpacity
          disabled={!selected || isLoading}
          onPress={handleContinue}
          className={`items-center rounded-xl py-3 ${
            selected
              ? "bg-black"
              : "bg-gray-100"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className={`text-[13px] font-semibold ${
                selected
                  ? "text-white"
                  : "text-gray-300"
              }`}
            >
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}