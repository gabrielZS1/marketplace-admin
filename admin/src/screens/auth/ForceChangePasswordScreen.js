import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyRound } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";

/**
 * Primeiro acesso do funcionário: a senha foi criada (ou redefinida) pelo dono, então ele
 * precisa escolher a própria senha antes de usar o app. O servidor também bloqueia o resto
 * da API até a troca, então esta tela não é só visual.
 */
export default function ForceChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const changeTemporaryPassword = useAuthStore((s) => s.changeTemporaryPassword);
  const logout = useAuthStore((s) => s.logout);
  const name = useAuthStore((s) => s.user?.name);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sameAsTemporary = next.length > 0 && next === current;
  const valid =
    current.length > 0 && next.length >= 8 && next === confirm && !sameAsTemporary;

  async function handleSave() {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await changeTemporaryPassword(current, next);
      // A store libera o app; esta tela some sozinha.
    } catch (err) {
      setError(err.message || "Não foi possível trocar a senha.");
      setLoading(false);
    }
  }

  const firstName = name ? name.split(" ")[0] : null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 32,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F5F6F8]">
          <KeyRound size={24} color="#111827" strokeWidth={2} />
        </View>

        <Text className="mt-5 text-2xl font-bold text-[#111827]">
          {firstName ? `Olá, ${firstName}! Crie sua senha` : "Crie sua senha"}
        </Text>
        <Text className="mt-2 text-[13px] leading-5 text-gray-500">
          Você entrou com a senha temporária que o responsável criou. Escolha uma senha só sua
          para continuar.
        </Text>

        <View className="mt-4">
          <Field
            label="Senha temporária"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
          />
          <Field
            label="Nova senha"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder="Mínimo 8 caracteres"
          />
          <Field
            label="Confirmar nova senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={handleSave}
          />
        </View>

        {next.length > 0 && next.length < 8 ? (
          <Text className="mt-2 text-[12px] text-gray-400">
            A senha precisa ter pelo menos 8 caracteres.
          </Text>
        ) : null}
        {sameAsTemporary ? (
          <Text className="mt-2 text-[12px] text-red-600">
            Escolha uma senha diferente da temporária.
          </Text>
        ) : null}
        {confirm.length > 0 && next !== confirm ? (
          <Text className="mt-2 text-[12px] text-red-600">As senhas não conferem.</Text>
        ) : null}
        {error ? <Text className="mt-3 text-[13px] text-red-600">{error}</Text> : null}

        <View className="flex-1" />

        <View className="mt-8">
          <Button
            title="Salvar e continuar"
            onPress={handleSave}
            loading={loading}
            disabled={!valid}
          />
          <TouchableOpacity onPress={logout} className="mt-2 h-10 items-center justify-center">
            <Text className="text-[13px] text-gray-400">Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
