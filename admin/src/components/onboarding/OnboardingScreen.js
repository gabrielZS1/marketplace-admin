import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import Stepper from "./Stepper";

/**
 * Estrutura padrão das telas de cadastro:
 *  - área segura no topo
 *  - voltar + progresso segmentado
 *  - título + descrição
 *  - conteúdo (rolável opcional)
 *  - rodapé fixo com divisória (normalmente o botão Continuar)
 */
export default function OnboardingScreen({
  navigation,
  step,
  totalSteps,
  title,
  subtitle,
  children,
  footer,
  scroll = false,
  onBack,
}) {
  const insets = useSafeAreaInsets();
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: { paddingBottom: 24 },
        keyboardShouldPersistTaps: "handled",
      }
    : {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      <View className="px-5 pt-2">
        <TouchableOpacity
          onPress={onBack || (() => navigation.goBack())}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="mb-5 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>

        {typeof step === "number" && typeof totalSteps === "number" ? (
          <Stepper step={step} total={totalSteps} />
        ) : null}

        {title ? (
          <Text className="mt-6 text-2xl font-bold leading-8 text-[#111827]">
            {title}
          </Text>
        ) : null}

        {subtitle ? (
          <Text className="mt-2 text-[13px] leading-5 text-gray-500">{subtitle}</Text>
        ) : null}
      </View>

      <Content className="flex-1 px-5 pt-6" {...contentProps}>
        {children}
      </Content>

      {footer ? (
        <View
          className="border-t border-gray-100 px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
