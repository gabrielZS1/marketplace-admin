import {
  ChevronRight,
  Settings,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react-native";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import { useAuthStore } from "../../store/authStore";
import { businessApi } from "../../api/businessApi";

import BusinessSettingsMenu from "./BusinessSettingsMenu";

export default function ProfileScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const data = await businessApi.getMyStatus();
      setBusiness(data);
    } catch (error) {
      console.log("Erro ao carregar empresa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedSteps = 0;
  const totalSteps = 5;

  const progress =
    (completedSteps / totalSteps) * 100;

  return (
    <View className="flex-1 bg-white">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >

        <View className="h-[245px] bg-gray-300">

          <View className="absolute -bottom-9 left-0 right-0 items-center">
            <View className="h-[86px] w-[86px] items-center justify-center rounded-full border-[5px] border-white bg-gray-400">
              <View className="h-[68px] w-[68px] rounded-full bg-gray-300" />
            </View>

            <View className="mt-[-3px] flex-row items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
              <Star
                size={10}
                color="#999"
                fill="#999"
              />

              <Text className="ml-1 text-[9px] font-medium text-gray-500">
                Ainda não há avaliações
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5">

          <View className="mt-14 items-center">
            <Text className="text-[19px] font-bold text-black">
              {isLoading
                ? "Carregando..."
                : business?.name || "Minha empresa"}
            </Text>
          </View>

          <View
            className="mt-5 rounded-2xl border border-gray-200 bg-white px-5 py-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-semibold text-black">
                Iniciante
              </Text>

              <View className="flex-row items-center">
                <Text className="text-[11px] text-gray-500">
                  {completedSteps} de {totalSteps} concluído
                </Text>

                <ChevronRight
                  size={17}
                  color="#777"
                  className="ml-2"
                />
              </View>
            </View>

            <View className="mt-4 h-[7px] overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-gray-400"
                style={{
                  width: `${progress}%`,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-4 rounded-2xl border border-gray-200 bg-white px-5 py-5"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">

              <View className="h-11 w-11 items-center justify-center">
                <TrendingUp
                  size={29}
                  color="#000"
                  strokeWidth={2}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[13px] font-semibold text-black">
                  Estatísticas e Relatórios
                </Text>

                <Text className="mt-1 text-[10px] leading-4 text-gray-400">
                  Informações importantes sobre sua
                  {"\n"}
                  empresa e seus funcionários
                </Text>
              </View>

              <ChevronRight
                size={21}
                color="#000"
              />
            </View>
          </TouchableOpacity>

          <Text className="mt-10 text-[15px] font-semibold text-black">
            Pagamentos
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-5 rounded-2xl border border-gray-300 bg-white px-5 py-5"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">

              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F2B900]">
                <DollarSign
                  size={23}
                  color="#fff"
                  strokeWidth={2.5}
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-[13px] font-semibold text-black">
                  Veja o resumo das transações
                </Text>

                <Text className="mt-1 text-[10px] leading-4 text-gray-400">
                  Revise a lista de vendas recentes para
                  {"\n"}
                  certificar que todos os últimos agendamentos
                  {"\n"}
                  foram cobrados.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
   
      <BusinessSettingsMenu navigation={navigation} />
  
    </View>
  );
}