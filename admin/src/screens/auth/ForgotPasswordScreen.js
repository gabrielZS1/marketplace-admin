import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { authApi } from "../../api/authApi";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleEmailChange(value) {
    setEmail(value.replace(/\s/g, "").toLowerCase().slice(0, 100));
    if (error) setError("");
  }

  async function handleSubmit() {
    if (isLoading) return;

    const clean = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean)) {
      setError("Digite um e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: clean });
      // Resposta é sempre 204 (não revela se o e-mail existe).
      navigation.navigate("ResetPassword", { email: clean });
    } catch (err) {
      setError(err.message || "Não foi possível enviar o código. Tente de novo.");
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = email.length > 0 && !isLoading;

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

      <Text className="mb-2 text-2xl font-semibold">Esqueceu a senha</Text>
      <Text className="mb-8 text-gray-500">
        Digite seu e-mail. Se houver uma conta, você vai receber um código de 6
        dígitos para criar uma nova senha.
      </Text>

      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
        placeholder="Endereço de e-mail"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={handleEmailChange}
        editable={!isLoading}
      />

      {error ? (
        <Text className="mb-2 text-sm text-red-500">{error}</Text>
      ) : null}

      <TouchableOpacity
        className={`mt-4 items-center justify-center rounded-xl py-4 ${
          canSubmit ? "bg-black" : "bg-gray-200"
        }`}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className={`font-semibold ${
              canSubmit ? "text-white" : "text-gray-400"
            }`}
          >
            Enviar código
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        disabled={isLoading}
        onPress={() => navigation.navigate("ResetPassword", { email: email.trim().toLowerCase() })}
      >
        <Text className="text-center text-gray-500 underline">
          Já tenho um código
        </Text>
      </TouchableOpacity>
    </View>
  );
}
