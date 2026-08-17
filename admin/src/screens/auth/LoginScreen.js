import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Eye, EyeOff, Mail } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";

const MAX_EMAIL_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 8;

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  function handleEmailChange(value) {
    // Remove espaços e caracteres de controle
    const sanitized = value
      .replace(/\s/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, MAX_EMAIL_LENGTH);

    setEmail(sanitized.toLowerCase());

    if (validationError) {
      setValidationError("");
    }
  }

  function handlePasswordChange(value) {
    // Senha sem espaços e limitada a 8 caracteres
    const sanitized = value
      .replace(/\s/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, MAX_PASSWORD_LENGTH);

    setPassword(sanitized);

    if (validationError) {
      setValidationError("");
    }
  }

  function validateForm() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setValidationError("Digite seu e-mail.");
      return false;
    }

    if (cleanEmail.length > MAX_EMAIL_LENGTH) {
      setValidationError("O e-mail é muito longo.");
      return false;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setValidationError("Digite um e-mail válido.");
      return false;
    }

    if (!password) {
      setValidationError("Digite sua senha.");
      return false;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      setValidationError("A senha deve ter no máximo 8 caracteres.");
      return false;
    }

    return true;
  }

  async function handleLogin() {
    if (isLoading) return;

    setValidationError("");

    if (!validateForm()) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    await login(cleanEmail, password);
  }

  const canLogin =
    email.length > 0 &&
    password.length > 0 &&
    !isLoading;

  return (
    <View className="flex-1 bg-white px-6 pt-16">

      {/* Toggle */}
      <View className="mb-10 flex-row rounded-full bg-gray-100 p-1">

        <View className="flex-1 rounded-full bg-black py-2.5">
          <Text className="text-center font-medium text-white">
            Fazer login
          </Text>
        </View>

        <TouchableOpacity
          className="flex-1 py-2.5"
          onPress={() => navigation.navigate("Register")}
          disabled={isLoading}
        >
          <Text className="text-center font-medium text-gray-500">
            Inscrever-se
          </Text>
        </TouchableOpacity>

      </View>

      {/* Título */}
      <Text className="mb-8 text-center text-2xl font-semibold">
        Bem-vindo Empreendedor
      </Text>

      {/* E-mail */}
      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
        placeholder="Endereço de e-mail"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        maxLength={MAX_EMAIL_LENGTH}
        value={email}
        onChangeText={handleEmailChange}
        editable={!isLoading}
      />

      {/* Senha */}
      <View className="mb-2 flex-row items-center rounded-xl border border-gray-200 px-4 py-3.5">

        <TextInput
          className="flex-1"
          placeholder="Senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          textContentType="password"
          maxLength={MAX_PASSWORD_LENGTH}
          value={password}
          onChangeText={handlePasswordChange}
          editable={!isLoading}
        />

        <TouchableOpacity
          onPress={() => setShowPassword((previous) => !previous)}
          disabled={isLoading}
          hitSlop={10}
        >
          {showPassword ? (
            <EyeOff size={20} color="#9CA3AF" />
          ) : (
            <Eye size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>

      </View>

      {/* Contador da senha */}
      <Text className="mb-2 text-right text-[10px] text-gray-400">
        {password.length}/{MAX_PASSWORD_LENGTH}
      </Text>

      {/* Erros */}
      {validationError ? (
        <Text className="mb-2 text-sm text-red-500">
          {validationError}
        </Text>
      ) : null}

      {!validationError && error ? (
        <Text className="mb-2 text-sm text-red-500">
          {error}
        </Text>
      ) : null}

      {/* Login */}
      <TouchableOpacity
        className={`mt-4 flex-row items-center justify-center rounded-xl py-4 ${
          canLogin ? "bg-black" : "bg-gray-200"
        }`}
        onPress={handleLogin}
        disabled={!canLogin}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Mail
              size={18}
              color={canLogin ? "#fff" : "#9CA3AF"}
            />

            <Text
              className={`ml-2 font-semibold ${
                canLogin ? "text-white" : "text-gray-400"
              }`}
            >
              Entrar com e-mail
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Esqueci senha */}
      <TouchableOpacity
        className="mt-4"
        disabled={isLoading}
      >
        <Text className="text-center text-gray-500 underline">
          Esqueceu a senha
        </Text>
      </TouchableOpacity>

      {/* Separador */}
      <View className="my-8 flex-row items-center">

        <View className="h-px flex-1 bg-gray-200" />

        <Text className="mx-3 text-xs text-gray-400">
          OU FAÇA LOGIN COM
        </Text>

        <View className="h-px flex-1 bg-gray-200" />

      </View>

      {/* Login social */}
      <View className="flex-row gap-3">

        <TouchableOpacity
          disabled
          className="flex-1 items-center rounded-xl border border-gray-200 py-3.5 opacity-40"
        >
          <Text>G</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled
          className="flex-1 items-center rounded-xl border border-gray-200 py-3.5 opacity-40"
        >
          <Text>f</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}