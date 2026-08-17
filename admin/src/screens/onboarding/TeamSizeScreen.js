import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";

import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";

const TEAM_SIZES = [
  { value: 1, label: "Sou só eu" },
  { value: 2, label: "2 funcionários" },
  { value: 3, label: "3 funcionários" },
  { value: 4, label: "4 funcionários" },
  { value: 5, label: "Mais de 5" },
];

export default function TeamSizeScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const businessId = useOnboardingStore((state) => state.businessId);
  const [error, setError] = useState(null);

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
            style={{ width: "63%" }}
          />
        </View>

        {/* TÍTULO */}
        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">
            Qual é o tamanho da sua equipe?
          </Text>
        </View>

        {/* OPÇÕES */}
        <View className="mt-5">
          {TEAM_SIZES.map((item) => {
            const isSelected = selected === item.value;

            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.7}
                onPress={() => setSelected(item.value)}
                className="mb-3 flex-row items-center"
              >
                {/* RADIO */}
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <View className="h-3 w-3 rounded-full bg-black" />
                  )}
                </View>

                {/* TEXTO */}
                <Text className="ml-2 text-[10px] text-black">
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {error ? (
        <Text className="mt-3 text-[9px] text-red-500">{error}</Text>
      ) : null}

      {/* RODAPÉ */}
      <View className="px-4 pb-8">
        <TouchableOpacity
          disabled={!selected || isLoading}
          onPress={handleContinue}
          className={`items-center rounded-xl py-3 ${
            selected ? "bg-black" : "bg-gray-100"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className={`text-[13px] font-semibold ${
                selected ? "text-white" : "text-gray-300"
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