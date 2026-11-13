import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { useOnboardingStore } from "../../store/onboardingStore";
import { useBusinessStore } from "../../store/businessStore";
import { useAuthStore, setupPushNotifications } from "../../store/authStore";
import { openLegal } from "../../constants/legal";
import Button from "../../components/ui/Button";

// Mesma identidade da abertura do app: grafite + o amarelo da estrelinha.
const BG = "#111111";
const STAR = "#FFDD2D";

const NOTES = [
  {
    title: "O pagamento é combinado com o cliente",
    description:
      "A Glowly não processa pagamentos. O cliente paga direto pra você, no seu estabelecimento, do jeito que vocês combinarem.",
  },
  {
    title: "Você cuida do atendimento, a gente cuida da agenda",
    description:
      "A Glowly é a ponte entre você e seus clientes. Não nos responsabilizamos por problemas na prestação do serviço, atrasos, no-shows ou combinados feitos fora do app.",
  },
  {
    title: "Termos de Uso e Privacidade",
    description: "Você pode reler tudo quando quiser.",
    links: [
      { label: "Termos de Uso", kind: "terms" },
      { label: "Política de Privacidade", kind: "privacy" },
    ],
  },
];

function Sparkle({ size = 18, color = STAR }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 0 C12.9 6.6 17.4 11.1 24 12 C17.4 12.9 12.9 17.4 12 24 C11.1 17.4 6.6 12.9 0 12 C6.6 11.1 11.1 6.6 12 0 Z"
        fill={color}
      />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const ownerName = useAuthStore((state) => state.user?.name);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const fetchBusinessStatus = useBusinessStore((state) => state.fetchStatus);

  const firstName = ownerName ? ownerName.trim().split(/\s+/)[0] : null;

  // Entrada suave: cabeçalho e depois cada aviso, um após o outro.
  // Quem prefere menos movimento no sistema já vê tudo pronto.
  const reveal = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (!alive) return;
        if (reduce) {
          reveal.forEach((v) => v.setValue(1));
          return;
        }
        Animated.stagger(
          90,
          reveal.map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 420,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ).start();
      })
      .catch(() => reveal.forEach((v) => v.setValue(1)));
    return () => {
      alive = false;
    };
  }, [reveal]);

  const fadeUp = (v) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  });

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
    <View className="flex-1" style={{ backgroundColor: BG }}>
      {/* CABEÇALHO ESCURO */}
      <Animated.View
        className="px-6 pb-9"
        style={[{ paddingTop: insets.top + 28 }, fadeUp(reveal[0])]}
      >
        <View className="flex-row items-start justify-between">
          <Image
            source={require("../../../assets/img/intro-logo.png")}
            style={{ width: 46, height: 51 }}
            resizeMode="contain"
          />
          <Sparkle size={20} />
        </View>

        <Text
          className="mt-9 text-[34px] font-bold text-white"
          style={{ letterSpacing: -0.8, lineHeight: 40 }}
        >
          {firstName ? `Bem-vindo(a),\n${firstName}.` : "Bem-vindo(a)."}
        </Text>
        <Text className="mt-3 text-[15px] leading-6" style={{ color: "#B9BCC4" }}>
          Sua agenda já está pronta pra receber clientes. Antes de começar, só um
          resuminho rápido.
        </Text>
      </Animated.View>

      {/* FOLHA CLARA */}
      <View
        className="flex-1 bg-white px-6 pt-2"
        style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        >
          {NOTES.map((item, index) => (
            <Animated.View
              key={item.title}
              style={fadeUp(reveal[index + 1])}
              className={`flex-row py-5 ${index === NOTES.length - 1 ? "" : "border-b border-gray-100"}`}
            >
              <Text className="w-9 pt-0.5 text-[13px] font-semibold text-gray-300">
                {String(index + 1).padStart(2, "0")}
              </Text>

              <View className="flex-1">
                <Text className="text-[15px] font-semibold leading-5 text-[#111827]">
                  {item.title}
                </Text>
                <Text className="mt-1.5 text-[13px] leading-5 text-gray-500">
                  {item.description}
                </Text>

                {item.links ? (
                  <View className="mt-3 flex-row flex-wrap" style={{ gap: 18 }}>
                    {item.links.map((link) => (
                      <TouchableOpacity
                        key={link.kind}
                        onPress={() => openLegal(link.kind)}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      >
                        <Text className="text-[13px] font-semibold text-[#111827] underline">
                          {link.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, paddingTop: 8 }}>
          <Button title="Ir para minha agenda" onPress={handleEnter} loading={isLoading} />
        </View>
      </View>
    </View>
  );
}
