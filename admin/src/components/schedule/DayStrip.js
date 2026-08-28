import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Tira horizontal com os próximos `days` dias. `value` / `onChange` são
 * strings "YYYY-MM-DD".
 */
export default function DayStrip({ value, onChange, days = 30, minDate }) {
  const start = minDate ? dayjs(minDate) : dayjs();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {Array.from({ length: days }).map((_, i) => {
        const d = start.add(i, "day");
        const key = d.format("YYYY-MM-DD");
        const selected = key === value;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            onPress={() => onChange(key)}
            className={`h-16 w-14 items-center justify-center rounded-2xl border ${
              selected ? "border-[#111827] bg-[#111827]" : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-[10px] uppercase ${
                selected ? "text-white/70" : "text-gray-400"
              }`}
            >
              {i === 0 ? "hoje" : WEEKDAYS[d.day()]}
            </Text>
            <Text
              className={`mt-0.5 text-[16px] font-bold ${
                selected ? "text-white" : "text-[#111827]"
              }`}
            >
              {d.date()}
            </Text>
            <Text
              className={`text-[9px] ${selected ? "text-white/70" : "text-gray-400"}`}
            >
              {MONTHS[d.month()]}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View className="w-1" />
    </ScrollView>
  );
}
