import { TouchableOpacity, View } from "react-native";

export default function Toggle({ value, onValueChange }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${
        value ? "bg-[#111827]" : "bg-gray-300"
      }`}
    >
      <View className={`h-6 w-6 rounded-full bg-white ${value ? "ml-auto" : ""}`} />
    </TouchableOpacity>
  );
}
