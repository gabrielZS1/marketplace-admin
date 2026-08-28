import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import dayjs from "dayjs";

import { useBusinessStore } from "../../store/businessStore";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { scheduleApi, toIso } from "../../api/scheduleApi";
import Button from "../../components/ui/Button";
import DayStrip from "../../components/schedule/DayStrip";
import TimeStepper, { timeToMinutes } from "../../components/ui/TimeStepper";

export default function CreateTimeBlockScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topPad = useContentTopPadding(10);
  const businessId = useBusinessStore((s) => s.status?.id);

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValid = timeToMinutes(end) > timeToMinutes(start);

  async function handleSave() {
    if (!isValid || isLoading || !businessId) return;
    setError(null);
    setIsLoading(true);
    try {
      await scheduleApi.createTimeBlock(businessId, {
        startsAt: toIso(date, start),
        endsAt: toIso(date, end),
        reason: reason.trim(),
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Não foi possível salvar o bloqueio.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View
      className="flex-1 bg-white px-5"
      style={{ paddingTop: topPad, paddingBottom: Math.max(insets.bottom, 16) + 8 }}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} color="#111827" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#111827]">Bloquear horário</Text>
      </View>

      <Text className="mt-2 text-[13px] leading-5 text-gray-500">
        Fecha a agenda do estabelecimento nesse período — ninguém consegue agendar.
      </Text>

      <View className="mt-6 flex-1">
        <Text className="mb-2 text-[12px] font-medium uppercase tracking-wide text-gray-400">
          Dia
        </Text>
        <DayStrip value={date} onChange={setDate} />

        <View className="mt-6 flex-row" style={{ gap: 12 }}>
          <TimeStepper label="Início" value={start} onChange={setStart} />
          <TimeStepper label="Fim" value={end} onChange={setEnd} />
        </View>

        {!isValid ? (
          <Text className="mt-3 text-[12px] text-red-600">
            O fim precisa ser depois do início.
          </Text>
        ) : null}

        <View className="mt-6">
          <View className="absolute left-3 top-[-8px] z-10 bg-white px-1.5">
            <Text className="text-[11px] font-medium text-gray-400">Motivo (opcional)</Text>
          </View>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Ex.: almoço, manutenção, evento"
            placeholderTextColor="#9CA3AF"
            className="h-14 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
          />
        </View>

        {error ? (
          <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
        ) : null}
      </View>

      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} />
        </View>
        <View className="flex-1">
          <Button
            title="Bloquear"
            onPress={handleSave}
            loading={isLoading}
            disabled={!isValid}
          />
        </View>
      </View>
    </View>
  );
}
