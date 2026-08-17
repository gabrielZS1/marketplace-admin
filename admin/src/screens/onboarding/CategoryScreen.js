import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";

const MAIN_CATEGORIES = [
  { value: "BARBERSHOP", label: "Barbeiros" },
  { value: "MANICURE", label: "Manicure" },
  { value: "HAIRDRESSER", label: "Cabeleireiro" },
  { value: "EYEBROWS_LASHES", label: "Sobrancelhas e cílios" },
  { value: "SKINCARE", label: "Cuidados com a pele" },
  { value: "WELLNESS", label: "Saúde e bem-estar" },
];

const OTHER_CATEGORIES = [
  { value: "SPA", label: "Dia de SPA" },
  { value: "MAKEUP", label: "Maquiagem" },
  { value: "OTHER", label: "Outros" },
];

export default function CategoryScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const selectCategory = useOnboardingStore((state) => state.selectCategory);
  const isLoading = useOnboardingStore((state) => state.isLoading);
  const error = useOnboardingStore((state) => state.error);

  async function handleContinue() {
    if (!selected) return;
    const result = await selectCategory(selected);
    if (result.success) {
      navigation.navigate("BasicInfo");
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-16" contentContainerStyle={{ paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        {/* Barra de progresso */}
        <View className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <View className="h-full bg-green-500" style={{ width: "14%" }} />
        </View>

        <Text className="text-2xl font-semibold mb-2">
          Qual é o ramo de atividade da sua empresa?
        </Text>
        <Text className="text-gray-500 mb-6">
          Selecione a categoria que você acha que melhor representa a atividade da sua empresa.
        </Text>

        <View className="flex-row flex-wrap justify-between mb-8">
          {MAIN_CATEGORIES.map((cat) => {
            const isSelected = selected === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                className="w-[30%] items-center mb-6"
                onPress={() => setSelected(cat.value)}
              >
                <View
                  className={`w-20 h-20 rounded-full mb-2 ${
                    isSelected ? "bg-black" : "bg-gray-200"
                  }`}
                />
                <Text
                  className={`text-center text-xs ${
                    isSelected ? "font-semibold text-black" : "text-gray-600"
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-gray-400 text-sm mb-2">Outras categorias</Text>
        {OTHER_CATEGORIES.map((cat) => {
          const isSelected = selected === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              className={`flex-row justify-between items-center py-4 border-b border-gray-100 ${
                isSelected ? "bg-gray-50" : ""
              }`}
              onPress={() => setSelected(cat.value)}
            >
              <Text className={isSelected ? "font-semibold" : ""}>{cat.label}</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          );
        })}

        {error ? <Text className="text-red-500 text-sm mt-4">{error}</Text> : null}
      </ScrollView>

      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${selected ? "bg-black" : "bg-gray-200"}`}
          disabled={!selected || isLoading}
          onPress={handleContinue}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className={selected ? "text-white font-semibold" : "text-gray-400 font-semibold"}>
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}