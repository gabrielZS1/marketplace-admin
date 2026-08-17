import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Mail, Eye, EyeOff } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 100;
const MAX_PHONE_DIGITS = 11;
const MAX_PASSWORD_LENGTH = 8;

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const registerBusinessOwner = useAuthStore(
    (state) => state.registerBusinessOwner
  );

  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  // =========================
  // NOME
  // =========================

  function handleNameChange(value) {
    const sanitized = value
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, MAX_NAME_LENGTH);

    setName(sanitized);

    if (validationError) {
      setValidationError("");
    }
  }

  // =========================
  // E-MAIL
  // =========================

  function handleEmailChange(value) {
    const sanitized = value
      .replace(/\s/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, MAX_EMAIL_LENGTH)
      .toLowerCase();

    setEmail(sanitized);

    if (validationError) {
      setValidationError("");
    }
  }

  // =========================
  // TELEFONE
  // =========================

  function formatPhone(value) {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, MAX_PHONE_DIGITS);

    if (numbers.length === 0) {
      return "";
    }

    if (numbers.length <= 2) {
      return `(${numbers}`;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      7
    )}-${numbers.slice(7)}`;
  }

  function handlePhoneChange(value) {
    setPhone(formatPhone(value));

    if (validationError) {
      setValidationError("");
    }
  }

  // =========================
  // SENHA
  // =========================

  function handlePasswordChange(value) {
    const sanitized = value
      .replace(/\s/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .slice(0, MAX_PASSWORD_LENGTH);

    setPassword(sanitized);

    if (validationError) {
      setValidationError("");
    }
  }

  // =========================
  // VALIDAÇÃO
  // =========================

  function validateForm() {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");

    if (!cleanName) {
      setValidationError("Digite seu nome completo.");
      return false;
    }

    if (cleanName.length < 3) {
      setValidationError(
        "O nome deve ter pelo menos 3 caracteres."
      );
      return false;
    }

    if (cleanName.length > MAX_NAME_LENGTH) {
      setValidationError("O nome é muito longo.");
      return false;
    }

    if (!cleanEmail) {
      setValidationError("Digite seu e-mail.");
      return false;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setValidationError("Digite um e-mail válido.");
      return false;
    }

    if (phoneDigits.length !== 11) {
      setValidationError(
        "Digite um telefone válido com DDD."
      );
      return false;
    }

    if (!password) {
      setValidationError("Digite uma senha.");
      return false;
    }

    if (password.length < 4) {
      setValidationError(
        "A senha deve ter pelo menos 4 caracteres."
      );
      return false;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      setValidationError(
        "A senha deve ter no máximo 8 caracteres."
      );
      return false;
    }

    return true;
  }

  // =========================
  // CADASTRO
  // =========================

  async function handleRegister() {
    if (isLoading) return;

    setValidationError("");

    if (!validateForm()) {
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Enviamos somente os números para o backend
    const cleanPhone = phone.replace(/\D/g, "");

    await registerBusinessOwner({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password,
    });
  }

  const canRegister =
    name.trim().length >= 3 &&
    email.length > 0 &&
    phone.replace(/\D/g, "").length === 11 &&
    password.length >= 4 &&
    !isLoading;

  return (
    <View className="flex-1 bg-white px-6 pt-16">

      {/* TOGGLE */}

      <View className="mb-10 flex-row rounded-full bg-gray-100 p-1">

        <TouchableOpacity
          className="flex-1 py-2.5"
          onPress={() => navigation.navigate("Login")}
          disabled={isLoading}
        >
          <Text className="text-center font-medium text-gray-500">
            Fazer login
          </Text>
        </TouchableOpacity>

        <View className="flex-1 rounded-full bg-black py-2.5">
          <Text className="text-center font-medium text-white">
            Inscrever-se
          </Text>
        </View>

      </View>

      {/* TÍTULO */}

      <Text className="mb-8 text-center text-2xl font-semibold">
        Criar uma conta
      </Text>

      {/* NOME */}

      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
        placeholder="Nome completo"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="name"
        textContentType="name"
        maxLength={MAX_NAME_LENGTH}
        value={name}
        onChangeText={handleNameChange}
        editable={!isLoading}
      />

      {/* E-MAIL */}

      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
        placeholder="Endereço de e-mail"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        maxLength={MAX_EMAIL_LENGTH}
        value={email}
        onChangeText={handleEmailChange}
        editable={!isLoading}
      />

      {/* TELEFONE */}

      <TextInput
        className="mb-3 rounded-xl border border-gray-200 px-4 py-3.5"
        placeholder="Telefone"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        maxLength={15}
        value={phone}
        onChangeText={handlePhoneChange}
        editable={!isLoading}
      />

      {/* SENHA */}

      <View className="mb-2 flex-row items-center rounded-xl border border-gray-200 px-4 py-3.5">

        <TextInput
          className="flex-1"
          placeholder="Senha"
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
          onPress={() =>
            setShowPassword((previous) => !previous)
          }
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

      {/* CONTADOR DA SENHA */}

      <Text className="mb-2 text-right text-[10px] text-gray-400">
        {password.length}/{MAX_PASSWORD_LENGTH}
      </Text>

      {/* ERRO DE VALIDAÇÃO */}

      {validationError ? (
        <Text className="mb-2 text-sm text-red-500">
          {validationError}
        </Text>
      ) : null}

      {/* ERRO DA API */}

      {!validationError && error ? (
        <Text className="mb-2 text-sm text-red-500">
          {error}
        </Text>
      ) : null}

      {/* BOTÃO */}

      <TouchableOpacity
        className={`mt-4 flex-row items-center justify-center rounded-xl py-4 ${
          canRegister ? "bg-black" : "bg-gray-200"
        }`}
        onPress={handleRegister}
        disabled={!canRegister}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Mail
              size={18}
              color={canRegister ? "#fff" : "#9CA3AF"}
            />

            <Text
              className={`ml-2 font-semibold ${
                canRegister
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              Continuar com e-mail
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* SEPARADOR */}

      <View className="my-8 flex-row items-center">

        <View className="h-px flex-1 bg-gray-200" />

        <Text className="mx-3 text-xs text-gray-400">
          OU INSCREVA-SE COM
        </Text>

        <View className="h-px flex-1 bg-gray-200" />

      </View>

      {/* REDES SOCIAIS */}

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