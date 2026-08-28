import { Text, TouchableOpacity, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

const STEP_MIN = 15;

export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min) {
  const n = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Seletor de horário com − / + de 15 min. `value` e `onChange` em "HH:mm".
 */
export default function TimeStepper({ label, value, onChange }) {
  function bump(delta) {
    onChange(minutesToTime(timeToMinutes(value) + delta));
  }

  return (
    <View className="flex-1 items-center rounded-2xl border border-gray-200 py-4">
      <Text className="text-[12px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </Text>
      <View className="mt-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => bump(-STEP_MIN)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Minus size={16} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="mx-4 text-xl font-bold text-[#111827]">{value}</Text>
        <TouchableOpacity
          onPress={() => bump(STEP_MIN)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Plus size={16} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
