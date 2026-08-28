import { Text, TouchableOpacity, View } from "react-native";
import { Check } from "lucide-react-native";

/**
 * Cartão de seleção (single ou multi). Usado nas telas de escolha do onboarding.
 *  control: "check" (quadrado) | "radio" (círculo) | "none"
 */
export default function OptionCard({
  title,
  description,
  selected,
  onPress,
  control = "check",
  icon = null,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-2xl border px-4 py-4 ${
        selected
          ? "border-[#111827] bg-[#F5F6F8]"
          : "border-gray-200 bg-white"
      }`}
    >
      {icon ? <View className="mr-3">{icon}</View> : null}

      <View className="flex-1">
        <Text
          className={`text-[15px] font-semibold ${
            selected ? "text-[#111827]" : "text-gray-800"
          }`}
        >
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 text-[12px] leading-4 text-gray-500">
            {description}
          </Text>
        ) : null}
      </View>

      {control !== "none" ? (
        <View
          className={`ml-3 h-6 w-6 items-center justify-center border ${
            control === "radio" ? "rounded-full" : "rounded-md"
          } ${selected ? "border-[#111827] bg-[#111827]" : "border-gray-300 bg-white"}`}
        >
          {selected ? (
            control === "radio" ? (
              <View className="h-2.5 w-2.5 rounded-full bg-white" />
            ) : (
              <Check size={15} color="#fff" strokeWidth={3} />
            )
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
