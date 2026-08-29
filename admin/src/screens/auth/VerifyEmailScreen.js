import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, MailCheck } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";

export default function VerifyEmailScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  function handleCodeChange(value) {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    if (error) setError("");
  }

  async function handleVerify() {
    if (isLoading || code.length !== 6) return;
    setError("");
    setIsLoading(true);
    try {
      await verifyEmail(code);
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Código inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (isResending) return;
    setError("");
    setResent(false);
    setIsResending(true);
    try {
      await resendVerification();
      setResent(true);
    } catch (err) {
      setError(err.message || "Não foi possível reenviar o código.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mb-8 flex-row items-center"
        hitSlop={10}
      >
        <ChevronLeft size={20} color="#6B7280" />
        <Text className="ml-1 text-gray-500">Voltar</Text>
      </TouchableOpacity>

      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#F5F6F8]">
        <MailCheck size={26} color="#111827" strokeWidth={2} />
      </View>

      <Text className="mb-2 text-2xl font-semibold">Confirme seu e-mail</Text>
      <Text className="mb-8 text-gray-500">
        Enviamos um código de 6 dígitos para{" "}
        <Text className="font-semibold text-gray-700">
          {user?.email ?? "seu e-mail"}
        </Text>
        .
      </Text>

      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5 tracking-[8px]"
        placeholder="000000"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={handleCodeChange}
        editable={!isLoading}
      />

      {error ? (
        <Text className="mb-2 text-sm text-red-500">{error}</Text>
      ) : null}
      {resent && !error ? (
        <Text className="mb-2 text-sm text-green-600">
          Código reenviado. Confira seu e-mail.
        </Text>
      ) : null}

      <TouchableOpacity
        className={`mt-4 items-center justify-center rounded-xl py-4 ${
          code.length === 6 && !isLoading ? "bg-black" : "bg-gray-200"
        }`}
        onPress={handleVerify}
        disabled={code.length !== 6 || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className={`font-semibold ${
              code.length === 6 ? "text-white" : "text-gray-400"
            }`}
          >
            Confirmar
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={handleResend}
        disabled={isResending}
      >
        <Text className="text-center text-gray-500 underline">
          {isResending ? "Reenviando..." : "Reenviar código"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
