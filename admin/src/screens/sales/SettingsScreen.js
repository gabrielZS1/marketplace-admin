import {
  ArrowLeft,
  Search,
  Award,
  List,
  CalendarDays,
  Users,
  Gift,
  Package,
  CreditCard,
  Building2,
  CalendarCheck,
  Settings2,
  UserRound,
  WalletCards,
} from "lucide-react-native";

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SETTINGS = [
  {
    title: "Detalhes da Empresa",
    description:
      "Adicione informações sobre sua marca, altere configurações de localização e entre outros dados da empresa.",
    icon: Building2,
  },
  {
    title: "Programa de Cartões de Fidelidade",
    description:
      "Crie cartões de fidelidade para os clientes e acompanhe suas recompensas.",
    icon: Award,
  },
  {
    title: "Configurações de Serviços",
    description:
      "Permita que clientes possam compartilhar serviços presentes e compartilhem o seu talento com seus familiares ou amigos.",
    icon: List,
  },
  {
    title: "Gerenciamento de horários",
    description:
      "Insira seus horários e os ajuste regularmente ou combine um ou mais serviços em um pacote.",
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
      "Ofereça assinaturas para que seus clientes agendem quais serviços quiserem durante o período que você determinar.",
    icon: CreditCard,
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
    icon: Settings2,
  },
  {
    title: "Configurações personalizadas",
    description:
      "Defina suas preferências de notificações e altere entre perfis de empresa.",
    icon: UserRound,
  },
  {
    title: "Assinatura e cobranças",
    description:
      "Gerencie suas assinaturas, valores mensais, formas de pagamento e cobranças.",
    icon: WalletCards,
  },
];

export default function SettingsScreen({ navigation }) {
  return (
    <View className="flex-1 bg-white">

      {/* CONTEÚDO ROLÁVEL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 32,
          paddingHorizontal: 14,
          paddingBottom: 40,
        }}
      >

        {/* CABEÇALHO */}
        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-2 h-8 w-8 items-center justify-center"
          >
            <ArrowLeft
              size={22}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <Text className="text-[18px] font-semibold text-black">
            Configurações
          </Text>

        </View>

        {/* BUSCA */}
        <View className="mt-4 h-8 flex-row items-center rounded-full bg-[#d9d9d9] px-3">

          <Search
            size={14}
            color="#aaa"
            strokeWidth={2}
          />

          <TextInput
            placeholder="Pesquisar nas configurações..."
            placeholderTextColor="#aaa"
            className="ml-2 flex-1 text-[9px] text-black"
          />

        </View>

        {/* LISTA */}
        <View className="mt-5">

          {SETTINGS.map((item, index) => {
            const Icon = item.icon;

            return (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.7}
                className="min-h-[64px] flex-row items-center border-b border-gray-200 py-3"
              >

                {/* ÍCONE */}
                <View className="w-8 items-center justify-center">
                  <Icon
                    size={21}
                    color="#000"
                    strokeWidth={2}
                  />
                </View>

                {/* TEXTO */}
                <View className="ml-3 flex-1 pr-2">

                  <Text
                    numberOfLines={1}
                    className="text-[10px] font-semibold text-black"
                  >
                    {item.title}
                  </Text>

                  <Text
                    numberOfLines={2}
                    className="mt-0.5 text-[7px] leading-[9px] text-gray-400"
                  >
                    {item.description}
                  </Text>

                </View>

              </TouchableOpacity>
            );
          })}

        </View>

      </ScrollView>

    </View>
  );
}