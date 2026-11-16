import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import useScreenScale from "../hooks/useScreenScale";

// Fundo das telas de conta (esqueci a senha, nova senha, verificar e-mail):
// rola quando a tela é pequena ou o teclado está aberto, e respeita a área do
// relógio/câmera e da barra de gestos.
export default function AuthScroll({ children }) {
  const { s, insets } = useScreenScale();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 12, s(64)),
          paddingBottom: insets.bottom + 24,
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
