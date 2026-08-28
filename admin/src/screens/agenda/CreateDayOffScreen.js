import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, ChevronDown, Check } from "lucide-react-native";
import dayjs from "dayjs";

import { useBusinessStore } from "../../store/businessStore";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { getEmployees } from "../../api/employeeApi";
import { scheduleApi, toIso } from "../../api/scheduleApi";
import Button from "../../components/ui/Button";
import DayStrip from "../../components/schedule/DayStrip";
import TimeStepper, { timeToMinutes } from "../../components/ui/TimeStepper";

const OVERLAY_MAX = 0.5;

export default function CreateDayOffScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topPad = useContentTopPadding(10);
  const businessId = useBusinessStore((s) => s.status?.id);

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(route?.params?.employee || null);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [allDay, setAllDay] = useState(true);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const overlay = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (!businessId) return;
    getEmployees(businessId)
      .then((list) => setEmployees((list || []).filter((e) => e.active !== false)))
      .catch(() => {});
  }, [businessId]);

  function openPicker() {
    setPickerOpen(true);
    overlay.setValue(0);
    sheetY.setValue(40);
    Animated.parallel([
      Animated.timing(overlay, { toValue: OVERLAY_MAX, duration: 200, useNativeDriver: true }),
      Animated.spring(sheetY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
    ]).start();
  }
  function closePicker() {
    Animated.parallel([
      Animated.timing(overlay, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 40, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => finished && setPickerOpen(false));
  }

  const rangeOk = allDay
    ? !dayjs(endDate).isBefore(dayjs(startDate))
    : timeToMinutes(end) > timeToMinutes(start);
  const isValid = !!employee && rangeOk;

  async function handleSave() {
    if (!isValid || isLoading || !businessId) return;
    setError(null);
    setIsLoading(true);
    try {
      await scheduleApi.createTimeOff(businessId, {
        employeeId: employee.id,
        startsAt: toIso(startDate, allDay ? "00:00" : start),
        endsAt: toIso(allDay ? endDate : startDate, allDay ? "23:59" : end),
        allDay,
        reason: reason.trim(),
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Não foi possível salvar a folga.");
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
        <Text className="text-2xl font-bold text-[#111827]">Adicionar folga</Text>
      </View>

      <Text className="mt-2 text-[13px] leading-5 text-gray-500">
        O profissional fica indisponível para novos agendamentos nesse período.
      </Text>

      <View className="mt-6 flex-1">
        {/* PROFISSIONAL */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openPicker}
          className="h-14 flex-row items-center rounded-2xl border border-gray-200 px-4"
        >
          <Text
            className={`flex-1 text-[15px] ${
              employee ? "font-medium text-[#111827]" : "text-gray-400"
            }`}
          >
            {employee?.name || "Escolher profissional"}
          </Text>
          <ChevronDown size={18} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {/* DIA INTEIRO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAllDay((v) => !v)}
          className="mt-4 flex-row items-center"
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-md border ${
              allDay ? "border-[#111827] bg-[#111827]" : "border-gray-300 bg-white"
            }`}
          >
            {allDay ? <Check size={15} color="#fff" strokeWidth={3} /> : null}
          </View>
          <Text className="ml-3 text-[14px] font-medium text-[#111827]">Dia inteiro</Text>
        </TouchableOpacity>

        <Text className="mb-2 mt-5 text-[12px] font-medium uppercase tracking-wide text-gray-400">
          {allDay ? "Do dia" : "Dia"}
        </Text>
        <DayStrip value={startDate} onChange={setStartDate} />

        {allDay ? (
          <>
            <Text className="mb-2 mt-4 text-[12px] font-medium uppercase tracking-wide text-gray-400">
              Até o dia
            </Text>
            <DayStrip value={endDate} onChange={setEndDate} minDate={startDate} />
          </>
        ) : (
          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <TimeStepper label="Início" value={start} onChange={setStart} />
            <TimeStepper label="Fim" value={end} onChange={setEnd} />
          </View>
        )}

        {!rangeOk ? (
          <Text className="mt-3 text-[12px] text-red-600">
            {allDay ? "O dia final não pode ser antes do inicial." : "O fim precisa ser depois do início."}
          </Text>
        ) : null}

        <View className="mt-5">
          <View className="absolute left-3 top-[-8px] z-10 bg-white px-1.5">
            <Text className="text-[11px] font-medium text-gray-400">Motivo (opcional)</Text>
          </View>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Ex.: férias, consulta médica"
            placeholderTextColor="#9CA3AF"
            className="h-14 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
          />
        </View>

        {error ? <Text className="mt-3 text-[13px] text-red-600">{error}</Text> : null}
      </View>

      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <Button title="Cancelar" variant="outline" onPress={() => navigation.goBack()} />
        </View>
        <View className="flex-1">
          <Button title="Salvar folga" onPress={handleSave} loading={isLoading} disabled={!isValid} />
        </View>
      </View>

      <Modal visible={pickerOpen} transparent animationType="none" onRequestClose={closePicker}>
        <View className="flex-1 justify-end">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay }}
          />
          <Pressable onPress={closePicker} className="absolute inset-0" />
          <Animated.View
            style={{ transform: [{ translateY: sheetY }], paddingBottom: Math.max(insets.bottom, 16) + 8 }}
            className="rounded-t-3xl bg-white px-5 pt-5"
          >
            <Text className="text-lg font-bold text-[#111827]">Profissional</Text>
            <View className="mt-3">
              {employees.length === 0 ? (
                <View className="items-center py-6">
                  <ActivityIndicator color="#111827" />
                </View>
              ) : (
                employees.map((e) => {
                  const sel = employee?.id === e.id;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setEmployee(e);
                        closePicker();
                      }}
                      className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
                        sel ? "border-[#111827] bg-[#F5F6F8]" : "border-gray-200"
                      }`}
                    >
                      <Text className="flex-1 text-[15px] font-medium text-[#111827]">
                        {e.name}
                      </Text>
                      {sel ? <Check size={18} color="#111827" strokeWidth={2.5} /> : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
