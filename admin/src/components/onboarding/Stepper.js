import { View } from "react-native";

/**
 * Progresso segmentado do onboarding: um traço por etapa, preenchidos até a atual.
 */
export default function Stepper({ step, total }) {
  return (
    <View className="flex-row" style={{ gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1 flex-1 rounded-full ${
            i < step ? "bg-[#111827]" : "bg-gray-200"
          }`}
        />
      ))}
    </View>
  );
}
