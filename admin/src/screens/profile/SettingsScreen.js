import {
  ChevronLeft,
  Search,
  CheckCircle,
  List,
  CalendarDays,
  Users,
  Gift,
  Package,
  CreditCard,
  Building2,
  CalendarCheck,
  Settings,
  UserRound,
  Wallet,
  LogOut,
} from "lucide-react-native";

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "../../store/authStore";

const OPTIONS = [
  {
    title: "Programa de Cartões de Fidelidade",
    description:
      "Crie cartões de fidelidade para clientes e acompanhe suas recompensas.",
    icon: CheckCircle,
  },
  {
    title: "Configurações de Serviços",
    description:
      "Permita que clientes comprem cartões presentes e compartilhem o seu talento com seus familiares e amigos.",
    icon: List,
  },
  {
    title: "Gerenciamento de horários",
    description:
      "Insira os horários e dias que funcionam regularmente ou combine um ou mais serviços em um pacote.",
    icon: CalendarDays,
  },
  {
    title: "Gestão de Funcionários",
    description:
      "Adicione novos funcionários, defina permissões e ajuste detalhes da equipe.",
    icon: Users,
  },
  {
    title: "Cartões Presente",
    description:
      "Permita que clientes comprem cartões presentes e compartilhem o seu talento com seus familiares e amigos.",
    icon: Gift,
  },
  {
    title: "Pacotes",
    description:
      "Incentive seus clientes a te visitarem regularmente ao combinar um ou mais serviços em um pacote.",
    icon: Package,
  },
  {
    title: "Assinaturas",
    description:
      "Ofereça assinaturas para que seus clientes agendem mais serviços regularmente.",
    icon: CreditCard,
  },
  {
    title: "Detalhes da Empresa",
    description:
      "Adicione informações sobre sua marca, altere configurações de localização e critérios do seu conhecimento para clientes.",
    icon: Building2,
  },
  {
    title: "Agendamentos Online",
    description:
      "Onde seus clientes podem te encontrar?",
    icon: CalendarCheck,
  },
  {
    title: "Opções avançadas",
    description:
      "Configurações de reservas, lembretes e outras opções.",
    icon: Settings,
  },
  {
    title: "Configurações personalizadas",
    description:
      "Defina suas preferências de notificação e altere entre perfis de empresa.",
    icon: UserRound,
  },
  {
    title: "Assinatura e cobranças",
    description:
      "Gerencie sua assinatura, valores e opções de pagamento.",
    icon: Wallet,
  },
];

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 bg-white">

      <View className="px-5 pt-14">

        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <ChevronLeft
              size={25}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <Text className="text-[20px] font-bold text-black">
            Configurações
          </Text>

        </View>

        <View className="mt-5 h-10 flex-row items-center rounded-xl bg-gray-200 px-3">

          <Search
            size={17}
            color="#aaa"
          />

          <TextInput
            placeholder="Pesquisar nas configurações..."
            placeholderTextColor="#999"
            className="ml-2 flex-1 text-[11px] text-black"
          />

        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 22,
          paddingBottom: 40,
        }}
      >

        {OPTIONS.map((option, index) => {

          const Icon = option.icon;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              className="min-h-[78px] flex-row border-b border-gray-200 py-4"
            >

              <View className="w-8 items-center justify-start pt-1">
                <Icon
                  size={23}
                  color="#000"
                  strokeWidth={2}
                />
              </View>

              <View className="ml-3 flex-1 pr-2">

                <Text className="text-[13px] font-semibold text-black">
                  {option.title}
                </Text>

                <Text className="mt-1 text-[9px] leading-3 text-gray-400">
                  {option.description}
                </Text>

              </View>

            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={logout}
          className="min-h-[78px] flex-row border-b border-gray-200 py-4"
        >

          <View className="w-8 items-center justify-start pt-1">
            <LogOut
              size={23}
              color="#000"
              strokeWidth={2}
            />
          </View>

          <View className="ml-3 flex-1 pr-2">

            <Text className="text-[13px] font-semibold text-black">
              Sair
            </Text>

            <Text className="mt-1 text-[9px] leading-3 text-gray-400">
              Sair da sua conta neste dispositivo.
            </Text>

          </View>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}