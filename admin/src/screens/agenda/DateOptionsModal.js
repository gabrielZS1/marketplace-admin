import { useMemo, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";

const WEEK_DAYS = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];

export default function DateOptionsModal({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate || new Date())
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = new Date(year, month, 0).getDate();

    const result = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({
        day: previousMonthDays - i,
        date: new Date(year, month - 1, previousMonthDays - i),
        outside: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        day,
        date: new Date(year, month, day),
        outside: false,
      });
    }

    let nextDay = 1;

    while (result.length < 42) {
      result.push({
        day: nextDay,
        date: new Date(year, month + 1, nextDay),
        outside: true,
      });

      nextDay++;
    }

    return result;
  }, [year, month]);

  const isSameDay = (a, b) => {
    if (!a || !b) return false;

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (date) => {
    onSelectDate(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30 justify-start pt-28 px-4">
        <View className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
            <View>
              <Text className="text-[12px] text-gray-400">
                SELECIONE UMA DATA
              </Text>

              <Text className="mt-1 text-[20px] font-semibold text-black capitalize">
                {monthName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between px-5 pb-4">
            <TouchableOpacity
              onPress={goToPreviousMonth}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <ChevronLeft size={22} color="#000" />
            </TouchableOpacity>

            <Text className="text-[15px] font-medium capitalize text-black">
              {monthName}
            </Text>

            <TouchableOpacity
              onPress={goToNextMonth}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <ChevronRight size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="px-4">
            <View className="mb-2 flex-row">
              {WEEK_DAYS.map((day) => (
                <View
                  key={day}
                  className="flex-1 items-center justify-center"
                >
                  <Text className="text-[10px] font-medium text-gray-400">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {days.map((item, index) => {
                const selected = isSameDay(
                  item.date,
                  new Date(selectedDate)
                );

                const today = isSameDay(item.date, new Date());

                return (
                  <TouchableOpacity
                    key={`${item.date.toISOString()}-${index}`}
                    onPress={() => handleSelectDate(item.date)}
                    className="w-[14.285%] items-center justify-center py-2"
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        selected ? "bg-red-400" : ""
                      }`}
                    >
                      <Text
                        className={`text-[12px] ${
                          selected
                            ? "font-bold text-white"
                            : item.outside
                            ? "text-gray-300"
                            : "text-black"
                        }`}
                      >
                        {item.day}
                      </Text>
                    </View>

                    {today && !selected && (
                      <View className="absolute bottom-1 h-1 w-1 rounded-full bg-red-400" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="border-t border-gray-100 px-5 py-4">
            <TouchableOpacity
              onPress={() => handleSelectDate(new Date())}
              className="items-center justify-center rounded-xl py-3"
            >
              <Text className="text-[14px] font-semibold text-red-400">
                Ir para hoje
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}