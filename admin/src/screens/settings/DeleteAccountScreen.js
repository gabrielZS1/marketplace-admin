import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TriangleAlert } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import { useAuthStore } from "../../store/authStore";

export default function DeleteAccountScreen({ navigation }) {
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete =
    confirmText.trim().toUpperCase() === "EXCLUIR" && !isLoading;

  async function handleDelete() {
    if (!canDelete) return;
    setError("");
    setIsLoading(true);
    try {
      await deleteAccount(password || undefined);
      // authStore limpa o token → RootNavigator manda pro login sozinho.
    } catch (err) {
      setError(err.message || "Não foi possível excluir a conta.");
      setIsLoading(false);
    }
  }

  return (
    <Screen navigation={navigation} title="Excluir conta">
      <View className="mb-5 flex-row items-start rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
        <TriangleAlert size={18} color="#DC2626" strokeWidth={2} />
        <Text className="ml-2.5 flex-1 text-[12px] leading-4 text-[#7F1D1D]">
          Esta ação é permanente. Seus dados pessoais são removidos, seu acesso é
          encerrado e, se você for dono de um estabelecimento, ele é desativado.
        </Text>
      </View>

      <Text className="mb-4 text-[13px] leading-5 text-gray-500">
        O histórico de agendamentos e avaliações permanece no sistema de forma
        anonimizada, porque também é registro dos estabelecimentos envolvidos.
        {"\n\n"}
        Se você tem uma assinatura ativa, cancele antes de excluir a conta.
      </Text>

      <Text className="mb-1 text-[12px] font-medium text-gray-400">
        Senha (se sua conta tiver)
      </Text>
      <TextInput
        className="mb-4 h-14 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
        placeholder="Sua senha"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />

      <Text className="mb-1 text-[12px] font-medium text-gray-400">
        Digite <Text className="font-bold text-[#111827]">EXCLUIR</Text> para confirmar
      </Text>
      <TextInput
        className="mb-4 h-14 rounded-2xl border border-gray-200 px-4 text-[15px] tracking-[2px] text-[#111827]"
        placeholder="EXCLUIR"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="characters"
        autoCorrect={false}
        value={confirmText}
        onChangeText={setConfirmText}
        editable={!isLoading}
      />

      {error ? (
        <Text className="mb-3 text-sm text-red-600">{error}</Text>
      ) : null}

      <TouchableOpacity
        className={`items-center justify-center rounded-xl py-4 ${
          canDelete ? "bg-[#DC2626]" : "bg-gray-200"
        }`}
        onPress={handleDelete}
        disabled={!canDelete}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className={`font-semibold ${
              canDelete ? "text-white" : "text-gray-400"
            }`}
          >
            Excluir minha conta
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-3 items-center py-3"
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text className="text-[14px] font-medium text-gray-500">Cancelar</Text>
      </TouchableOpacity>
    </Screen>
  );
}
