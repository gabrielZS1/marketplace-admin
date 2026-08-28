import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Estrutura padrão de tela interna (fora do onboarding):
 *  voltar + título • conteúdo (rolável opcional) • rodapé fixo opcional.
 */
export default function Screen({
  navigation,
  title,
  subtitle,
  right = null,
  children,
  footer,
  scroll = true,
  onBack,
}) {
  const topPad = useContentTopPadding(8);
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
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: topPad }}
    >
      <View className="flex-row items-center px-5 pb-3">
        <TouchableOpacity
          onPress={onBack || (() => navigation.goBack())}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <ChevronLeft size={22} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text className="flex-1 text-[20px] font-bold text-[#111827]" numberOfLines={1}>
          {title}
        </Text>
        {right}
      </View>

      {subtitle ? (
        <Text className="px-5 pb-2 text-[13px] leading-5 text-gray-500">{subtitle}</Text>
      ) : null}

      <Content className="flex-1 px-5 pt-3" {...contentProps}>
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
