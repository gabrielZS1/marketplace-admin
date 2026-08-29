import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { CloudOff, Lock } from "lucide-react-native";

/**
 * Estado de "não deu pra carregar". Passe `onRetry` pra erro de rede;
 * `variant="denied"` pra falta de permissão (sem botão de tentar).
 */
export default function ErrorState({
  message = "Não foi possível carregar",
  hint = "Verifique sua conexão e tente de novo.",
  onRetry,
  loading = false,
  variant = "error",
}) {
  const Icon = variant === "denied" ? Lock : CloudOff;

  return (
    <View className="flex-1 items-center justify-center px-8 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon size={24} color="#9CA3AF" strokeWidth={1.8} />
      </View>
      <Text className="mt-4 text-center text-[15px] font-semibold text-[#111827]">
        {message}
      </Text>
      <Text className="mt-1 text-center text-[13px] leading-5 text-gray-400">{hint}</Text>

      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          disabled={loading}
          activeOpacity={0.85}
          className="mt-5 h-11 items-center justify-center rounded-2xl bg-[#111827] px-6"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[14px] font-semibold text-white">Tentar de novo</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
