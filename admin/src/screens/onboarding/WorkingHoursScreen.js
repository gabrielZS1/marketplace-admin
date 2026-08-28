import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, Minus, Plus } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const DEFAULT_HOURS = DAYS.reduce((acc, day, i) => {
  acc[day] = { enabled: i < 5, open: "10:00", close: "19:00" };
  return acc;
}, {});

const STEP_MIN = 15;

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const n = Math.max(0, Math.min(1425, minutes));
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function Toggle({ value, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`h-7 w-12 justify-center rounded-full px-0.5 ${
        value ? "bg-[#111827]" : "bg-gray-300"
      }`}
    >
      <View className={`h-6 w-6 rounded-full bg-white ${value ? "ml-auto" : ""}`} />
    </TouchableOpacity>
  );
}

function TimeStepper({ label, value, onChange }) {
  return (
    <View className="flex-1 items-center rounded-2xl border border-gray-200 py-4">
      <Text className="text-[12px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </Text>
      <View className="mt-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => onChange(-STEP_MIN)}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Minus size={16} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="mx-4 text-xl font-bold text-[#111827]">{value}</Text>
        <TouchableOpacity
          onPress={() => onChange(STEP_MIN)}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Plus size={16} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WorkingHoursScreen({ navigation }) {
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const businessId = useOnboardingStore((state) => state.businessId);

  function toggleDay(day) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function changeTime(day, type, amount) {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: minutesToTime(timeToMinutes(prev[day][type]) + amount),
      },
    }));
  }

  async function handleContinue() {
    if (isLoading) return;
    if (!businessId) {
      setError("Sessão de cadastro perdida. Volte e selecione a categoria novamente.");
      return;
    }

    const entries = DAYS.reduce((acc, day, index) => {
      if (hours[day].enabled) {
        acc.push({
          dayOfWeek: (index + 1) % 7,
          startTime: hours[day].open,
          endTime: hours[day].close,
        });
      }
      return acc;
    }, []);

    if (entries.length === 0) {
      setError("Selecione ao menos um dia de funcionamento.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onboardingApi.workingHours(businessId, entries);
      navigation.navigate("Services");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  // ----- Editor de um dia -----
  if (selectedDay) {
    const day = hours[selectedDay];
    return (
      <OnboardingScreen
        navigation={navigation}
        onBack={() => setSelectedDay(null)}
        title={selectedDay}
        subtitle="Ajuste o horário deste dia."
        footer={<Button title="Salvar" onPress={() => setSelectedDay(null)} />}
      >
        <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-4">
          <Text className="text-[15px] font-semibold text-[#111827]">
            {day.enabled ? "Aberto neste dia" : "Fechado neste dia"}
          </Text>
          <Toggle value={day.enabled} onPress={() => toggleDay(selectedDay)} />
        </View>

        {day.enabled ? (
          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <TimeStepper
              label="Abre"
              value={day.open}
              onChange={(a) => changeTime(selectedDay, "open", a)}
            />
            <TimeStepper
              label="Fecha"
              value={day.close}
              onChange={(a) => changeTime(selectedDay, "close", a)}
            />
          </View>
        ) : null}
      </OnboardingScreen>
    );
  }

  // ----- Lista de dias -----
  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("WorkingHours")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Horário de funcionamento"
      subtitle="Quando os clientes podem agendar com você."
      scroll
      footer={
        <Button title="Continuar" onPress={handleContinue} loading={isLoading} />
      }
    >
      {DAYS.map((day) => {
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
                className={`mt-0.5 text-[12px] ${
                  d.enabled ? "text-gray-500" : "text-gray-400"
                }`}
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
      })}

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}
    </OnboardingScreen>
  );
}
