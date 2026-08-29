import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { authApi } from "../../api/authApi";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

export default function ResetPasswordScreen({ navigation, route }) {
  const initialEmail = route.params?.email ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleCodeChange(value) {
    setCode(value.replace(/\D/g, "").slice(0, 6));
    if (error) setError("");
  }

  function handlePasswordChange(value) {
    setPassword(value.replace(/\s/g, "").slice(0, MAX_PASSWORD_LENGTH));
    if (error) setError("");
  }

  async function handleSubmit() {
    if (isLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Informe o e-mail.");
      return;
    }
    if (code.length !== 6) {
      setError("O código tem 6 dígitos.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: cleanEmail,
        code,
        newPassword: password,
      });
      Alert.alert("Senha alterada", "Faça login com a nova senha.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      setError(err.message || "Não foi possível redefinir a senha.");
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit =
    email.length > 0 &&
    code.length === 6 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !isLoading;

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

      <Text className="mb-2 text-2xl font-semibold">Nova senha</Text>
      <Text className="mb-8 text-gray-500">
        Digite o código que enviamos para {email || "seu e-mail"} e escolha uma
        nova senha.
      </Text>

      {!initialEmail ? (
        <TextInput
          className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
          placeholder="Endereço de e-mail"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={(v) => setEmail(v.replace(/\s/g, "").toLowerCase())}
          editable={!isLoading}
        />
      ) : null}

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

      <View className="mb-2 flex-row items-center rounded-xl border border-gray-200 px-4 py-3.5">
        <TextInput
          className="flex-1 text-[15px] text-[#111827]"
          placeholder="Nova senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          maxLength={MAX_PASSWORD_LENGTH}
          value={password}
          onChangeText={handlePasswordChange}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((p) => !p)}
          disabled={isLoading}
          hitSlop={10}
        >
          {showPassword ? (
            <Eye size={20} color="#9CA3AF" />
          ) : (
            <EyeOff size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>
      <Text
        className={`mb-2 text-right text-[10px] ${
          password.length > 0 && password.length < MIN_PASSWORD_LENGTH
            ? "text-amber-600"
            : "text-gray-400"
        }`}
      >
        {password.length} {password.length === 1 ? "caractere" : "caracteres"}
        {password.length < MIN_PASSWORD_LENGTH ? ` · mínimo ${MIN_PASSWORD_LENGTH}` : ""}
      </Text>

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
            Redefinir senha
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
