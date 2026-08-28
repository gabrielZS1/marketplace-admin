import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

/**
 * Botão padrão do app.
 *  variant: "primary" (grafite) | "outline" (borda) | "ghost" (texto)
 */
export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
}) {
  const isDisabled = disabled || loading;

  const bg = {
    primary: isDisabled ? "bg-gray-200" : "bg-[#111827]",
    outline: "border border-gray-300 bg-white",
    ghost: "bg-transparent",
  }[variant];

  const textColor = {
    primary: isDisabled ? "text-gray-400" : "text-white",
    outline: "text-[#111827]",
    ghost: "text-gray-500",
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={
        variant === "primary" && !isDisabled
          ? {
              shadowColor: "#111827",
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }
          : undefined
      }
      className={`h-14 flex-row items-center justify-center rounded-2xl px-5 ${bg} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#111827"} />
      ) : (
        <Text className={`text-[15px] font-semibold ${textColor}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
