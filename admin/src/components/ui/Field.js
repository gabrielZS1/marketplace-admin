import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";

/**
 * Campo de texto com rótulo flutuante e estado de foco.
 */
export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  clearable = false,
  multiline = false,
  style,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mt-4" style={style}>
      {label ? (
        <View className="absolute left-3 top-[-8px] z-10 bg-white px-1.5">
          <Text
            className={`text-[11px] font-medium ${
              focused ? "text-[#111827]" : "text-gray-400"
            }`}
          >
            {label}
          </Text>
        </View>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-2xl border px-4 text-[15px] text-[#111827] ${
          multiline ? "min-h-[96px] py-3" : "h-14"
        } ${clearable ? "pr-10" : ""} ${
          focused ? "border-[#111827]" : "border-gray-200"
        }`}
        {...inputProps}
      />

      {clearable && value?.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="absolute right-3 top-4"
        >
          <X size={16} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
