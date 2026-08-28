import { Alert, Text, TouchableOpacity, View } from "react-native";
import {
  Building2,
  Scissors,
  Clock,
  Users,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  Gift,
} from "lucide-react-native";

import { useAuthStore } from "../../store/authStore";
import Screen from "../../components/ui/Screen";

const SECTIONS = [
  {
    title: "Negócio",
    items: [
      {
        label: "Personalizar empresa",
        hint: "Nome, logo, fotos, endereço e contato",
        icon: Building2,
        target: "BusinessDetails",
      },
      {
        label: "Serviços",
        hint: "O que você oferece, preços e duração",
        icon: Scissors,
        target: "ManageServices",
      },
      {
        label: "Cartões-presente",
        hint: "Pacotes que os clientes podem comprar de presente",
        icon: Gift,
        target: "GiftCards",
      },
      {
        label: "Horário de funcionamento",
        hint: "Dias e horários que você atende",
        icon: Clock,
        target: "ManageHours",
      },
      {
        label: "Equipe",
        hint: "Profissionais do estabelecimento",
        icon: Users,
        target: "Funcionarios",
      },
    ],
  },
  {
    title: "Assinatura",
    items: [
      {
        label: "Plano e cobrança",
        hint: "Seu plano, período de teste e pagamento",
        icon: CreditCard,
        target: "Billing",
      },
    ],
  },
  {
    title: "App",
    items: [
      {
        label: "Notificações",
        hint: "Avisos de novos agendamentos neste aparelho",
        icon: Bell,
        target: "NotificationSettings",
      },
    ],
  },
];

function Row({ item, onPress, last }) {
  const Icon = item.icon;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center py-4 ${last ? "" : "border-b border-gray-100"}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        <Icon size={18} color="#374151" strokeWidth={2} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-[#111827]">{item.label}</Text>
        <Text className="mt-0.5 text-[12px] text-gray-400">{item.hint}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);

  function confirmLogout() {
    Alert.alert("Sair da conta", "Você vai precisar entrar de novo neste aparelho.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <Screen navigation={navigation} title="Configurações">
      {SECTIONS.map((section) => (
        <View key={section.title} className="mb-6">
          <Text className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {section.title}
          </Text>
          {section.items.map((item, i) => (
            <Row
              key={item.label}
              item={item}
              last={i === section.items.length - 1}
              onPress={() => navigation.navigate(item.target)}
            />
          ))}
        </View>
      ))}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={confirmLogout}
        className="mt-2 flex-row items-center py-4"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <LogOut size={18} color="#DC2626" strokeWidth={2} />
        </View>
        <Text className="ml-3 text-[15px] font-semibold text-[#DC2626]">Sair da conta</Text>
      </TouchableOpacity>
    </Screen>
  );
}
