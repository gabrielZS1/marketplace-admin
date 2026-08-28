import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronRight } from "lucide-react-native";

import { useBusinessStore } from "../../store/businessStore";
import { businessApi } from "../../api/businessApi";
import { onboardingApi } from "../../api/onboardingApi";
import Screen from "../../components/ui/Screen";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import TimeStepper, { timeToMinutes } from "../../components/ui/TimeStepper";

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

// index (0=Segunda) -> dayOfWeek do backend (0=Domingo)
const toBackendDow = (i) => (i + 1) % 7;
const toIndex = (dow) => (dow + 6) % 7;

const DEFAULT = DAYS.reduce((acc, d, i) => {
  acc[d] = { enabled: i < 5, open: "09:00", close: "18:00" };
  return acc;
}, {});

export default function ManageHoursScreen({ navigation }) {
  const businessId = useBusinessStore((s) => s.status?.id);

  const [hours, setHours] = useState(DEFAULT);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!businessId) return;
    businessApi
      .getWorkingHours(businessId)
      .then((rows) => {
        const next = { ...DEFAULT };
        DAYS.forEach((d) => (next[d] = { ...next[d], enabled: false }));
        (rows || []).forEach((r) => {
          const d = DAYS[toIndex(r.dayOfWeek)];
          if (d) {
            next[d] = {
              enabled: true,
              open: String(r.startTime).slice(0, 5),
              close: String(r.endTime).slice(0, 5),
            };
          }
        });
        setHours(next);
      })
      .catch(() => setError("Não foi possível carregar os horários."))
      .finally(() => setLoading(false));
  }, [businessId]);

  useFocusEffect(load);

  function toggleDay(day) {
    setHours((p) => ({ ...p, [day]: { ...p[day], enabled: !p[day].enabled } }));
  }
  function changeTime(day, key, amount) {
    setHours((p) => {
      const cur = timeToMinutes(p[day][key]);
      const n = Math.max(0, Math.min(1425, cur + amount));
      const h = Math.floor(n / 60);
      const m = n % 60;
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      return { ...p, [day]: { ...p[day], [key]: t } };
    });
  }

  async function handleSave() {
    if (saving || !businessId) return;
    const entries = DAYS.reduce((acc, day, i) => {
      if (hours[day].enabled) {
        acc.push({
          dayOfWeek: toBackendDow(i),
          startTime: hours[day].open,
          endTime: hours[day].close,
        });
      }
      return acc;
    }, []);

    if (entries.length === 0) {
      setError("Marque pelo menos um dia de funcionamento.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onboardingApi.workingHours(businessId, entries);
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  // ---- Editor de um dia ----
  if (selectedDay) {
    const day = hours[selectedDay];
    return (
      <Screen
        navigation={navigation}
        title={selectedDay}
        onBack={() => setSelectedDay(null)}
        footer={<Button title="Pronto" onPress={() => setSelectedDay(null)} />}
      >
        <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-4">
          <Text className="text-[15px] font-semibold text-[#111827]">
            {day.enabled ? "Aberto neste dia" : "Fechado neste dia"}
          </Text>
          <Toggle value={day.enabled} onValueChange={() => toggleDay(selectedDay)} />
        </View>

        {day.enabled ? (
          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <TimeStepper
              label="Abre"
              value={day.open}
              onChange={(t) =>
                setHours((p) => ({ ...p, [selectedDay]: { ...p[selectedDay], open: t } }))
              }
            />
            <TimeStepper
              label="Fecha"
              value={day.close}
              onChange={(t) =>
                setHours((p) => ({ ...p, [selectedDay]: { ...p[selectedDay], close: t } }))
              }
            />
          </View>
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen
      navigation={navigation}
      title="Horário de funcionamento"
      subtitle="Quando os clientes podem agendar com você."
      footer={<Button title="Salvar" onPress={handleSave} loading={saving} />}
    >
      {loading ? (
        <ActivityIndicator className="mt-6" color="#111827" />
      ) : (
        DAYS.map((day) => {
          const d = hours[day];
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.8}
              onPress={() => setSelectedDay(day)}
              className="mb-2 flex-row items-center rounded-2xl border border-gray-200 px-4 py-4"
            >
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-[#111827]">{day}</Text>
                <Text
                  className={`mt-0.5 text-[12px] ${d.enabled ? "text-gray-500" : "text-gray-400"}`}
                >
                  {d.enabled ? `${d.open} – ${d.close}` : "Fechado"}
                </Text>
              </View>
              <View
                className={`mr-2 h-2 w-2 rounded-full ${
                  d.enabled ? "bg-[#16A34A]" : "bg-gray-300"
                }`}
              />
              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          );
        })
      )}

      {error ? <Text className="mt-3 text-[13px] text-red-600">{error}</Text> : null}
    </Screen>
  );
}
