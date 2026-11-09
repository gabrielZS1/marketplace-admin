import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PartyPopper, Wallet, Handshake, FileText } from "lucide-react-native";

import { useOnboardingStore } from "../../store/onboardingStore";
import { useBusinessStore } from "../../store/businessStore";
import { useAuthStore, setupPushNotifications } from "../../store/authStore";
import { openLegal } from "../../constants/legal";
import Button from "../../components/ui/Button";

const HIGHLIGHTS = [
  {
    Icon: Wallet,
    tint: "#ECFDF5",
    iconColor: "#059669",
    title: "O pagamento é combinado com o cliente",
    description:
      "A Glowly não processa pagamentos. O cliente paga direto pra você, no seu estabelecimento, do jeito que vocês combinarem.",
  },
  {
    Icon: Handshake,
    tint: "#EFF6FF",
    iconColor: "#2563EB",
    title: "Você cuida do atendimento, a gente cuida da agenda",
    description:
      "A Glowly é a ponte entre você e seus clientes. Não nos responsabilizamos por problemas na prestação do serviço, atrasos, no-shows ou combinados feitos fora do app.",
  },
  {
    Icon: FileText,
    tint: "#FFF7ED",
    iconColor: "#C2410C",
    title: "Termos de Uso e Privacidade",
    description: "Você pode reler tudo quando quiser.",
    links: [
      { label: "Termos de Uso", kind: "terms" },
      { label: "Política de Privacidade", kind: "privacy" },
    ],
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const ownerName = useAuthStore((state) => state.user?.name);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const fetchBusinessStatus = useBusinessStore((state) => state.fetchStatus);

  const firstName = ownerName ? ownerName.split(" ")[0] : null;

  async function handleEnter() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetchBusinessStatus();
      // Estabelecimento já existe agora — registra o token de push.
      setupPushNotifications();
      resetOnboarding();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
    >
      <ScrollView
        className="px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
          <PartyPopper size={30} color="#B45309" strokeWidth={2} />
        </View>

        <Text className="mt-5 text-[26px] font-bold leading-8 text-[#111827]">
          {firstName ? `Bem-vindo(a), ${firstName}!` : "Bem-vindo(a)!"}
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-gray-500">
          Sua agenda já está pronta pra receber clientes. Antes de começar, só um
          resuminho rápido:
        </Text>

        <View className="mt-6" style={{ gap: 14 }}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.title} className="flex-row rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: item.tint }}
              >
                <item.Icon size={18} color={item.iconColor} strokeWidth={2} />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-semibold text-[#111827]">
                  {item.title}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-gray-500">
                  {item.description}
                </Text>

                {item.links ? (
                  <View className="mt-2 flex-row" style={{ gap: 16 }}>
                    {item.links.map((link) => (
                      <TouchableOpacity key={link.kind} onPress={() => openLegal(link.kind)}>
                        <Text className="text-[13px] font-semibold text-[#111827] underline">
                          {link.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-6">
        <Button title="Ir para minha agenda 🚀" onPress={handleEnter} loading={isLoading} />
      </View>
    </View>
  );
}
