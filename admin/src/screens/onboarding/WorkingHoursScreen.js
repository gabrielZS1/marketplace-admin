import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react-native";

import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const DEFAULT_HOURS = {
  "Segunda-feira": {
    enabled: true,
    open: "10:00",
    close: "19:00",
  },
  "Terça-feira": {
    enabled: true,
    open: "10:00",
    close: "19:00",
  },
  "Quarta-feira": {
    enabled: true,
    open: "10:00",
    close: "19:00",
  },
  "Quinta-feira": {
    enabled: true,
    open: "10:00",
    close: "19:00",
  },
  "Sexta-feira": {
    enabled: true,
    open: "10:00",
    close: "19:00",
  },
  "Sábado": {
    enabled: false,
    open: "10:00",
    close: "19:00",
  },
  "Domingo": {
    enabled: false,
    open: "10:00",
    close: "19:00",
  },
};

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const normalized = Math.max(0, Math.min(1435, minutes));

  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}`;
}

export default function WorkingHoursScreen({ navigation }) {
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const businessId = useOnboardingStore((state) => state.businessId);
  const [error, setError] = useState(null);

  /*
   * ==========================================
   * LISTA DE HORÁRIOS
   * ==========================================
   */

  function openDay(day) {
    setSelectedDay(day);
  }

  function getDayHours(day) {
    return hours[day];
  }

  async function handleContinue() {
  if (isLoading) return;
  if (!businessId) {
    setError("Sessão de cadastro perdida. Volte e selecione a categoria novamente.");
    return;
  }

  const entries = DAYS.reduce((acc, day, index) => {
  const dayHours = hours[day];
  if (dayHours.enabled) {
    acc.push({
      dayOfWeek: (index + 1) % 7,
      startTime: dayHours.open,
      endTime: dayHours.close,
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

  /*
   * ==========================================
   * TELA DE CONFIGURAÇÃO DO DIA
   * ==========================================
   */

  function toggleDay() {
    setHours((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        enabled: !prev[selectedDay].enabled,
      },
    }));
  }

  function changeTime(type, amount) {
    const current = hours[selectedDay][type];

    let minutes = timeToMinutes(current);
    minutes += amount;

    // Limita entre 00:00 e 23:55
    minutes = Math.max(0, Math.min(1435, minutes));

    setHours((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [type]: minutesToTime(minutes),
      },
    }));
  }

  function saveDay() {
    setSelectedDay(null);
  }

  /*
   * ==========================================
   * TELA 2 — CONFIGURAÇÃO DO DIA
   * ==========================================
   */

  if (selectedDay) {
    const day = hours[selectedDay];

    const openMinutes = timeToMinutes(day.open);
    const closeMinutes = timeToMinutes(day.close);

    const previousOpen = minutesToTime(openMinutes - 5);
    const nextOpen = minutesToTime(openMinutes + 5);

    const previousClose = minutesToTime(closeMinutes - 5);
    const nextClose = minutesToTime(closeMinutes + 5);

    return (
      <View className="flex-1 bg-white">

        {/* CABEÇALHO */}
        <View className="px-4 pt-14">

          <View className="flex-row items-center justify-between">

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setSelectedDay(null)}
                className="mr-3"
              >
                <ChevronLeft
                  size={24}
                  color="#000"
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <Text className="text-[17px] font-semibold text-black">
                {selectedDay}
              </Text>
            </View>

            {/* SWITCH */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleDay}
              className={`h-6 w-10 rounded-full justify-center ${
                day.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  day.enabled ? "ml-[19px]" : "ml-[1px]"
                }`}
              />
            </TouchableOpacity>
          </View>

          {/* STATUS */}
          <Text className="mt-1 text-right text-[8px] text-gray-400">
            {day.enabled ? "Aberto" : "Fechado"}
          </Text>

          {/* LINHA */}
          <View className="mt-3 h-px bg-gray-200" />

          {/* TEXTO EXPLICATIVO */}
          <Text className="mt-2 text-[7px] leading-[9px] text-gray-400">
            Defina o seu horário de trabalho aqui. Vá para Dias de abertura
            no menu Configurações se precisar ajustar o horário para um único dia.
          </Text>
        </View>

        {day.enabled ? (
          <>
            {/* SELETORES DE HORÁRIO */}
            <View className="mt-4 flex-row justify-around px-8">

              {/* HORÁRIO DE ABERTURA */}
              <View className="items-center">

                <TouchableOpacity
                  onPress={() => changeTime("open", 5)}
                  className="h-7 items-center justify-center"
                >
                  <ChevronUp
                    size={25}
                    color="#bdbdbd"
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                <Text className="text-[11px] text-gray-300">
                  {previousOpen}
                </Text>

                <Text className="mt-2 text-[11px] text-gray-300">
                  {day.open === "00:00"
                    ? "23:55"
                    : minutesToTime(openMinutes - 5)}
                </Text>

                <View className="mt-2 h-7 w-24 items-center justify-center rounded-lg border border-gray-400 bg-white">
                  <Text className="text-[11px] font-medium text-black">
                    {day.open}
                  </Text>
                </View>

                <Text className="mt-2 text-[11px] text-gray-300">
                  {nextOpen}
                </Text>

                <TouchableOpacity
                  onPress={() => changeTime("open", -5)}
                  className="mt-1 h-7 items-center justify-center"
                >
                  <ChevronDown
                    size={25}
                    color="#bdbdbd"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>

              {/* HORÁRIO DE FECHAMENTO */}
              <View className="items-center">

                <TouchableOpacity
                  onPress={() => changeTime("close", 5)}
                  className="h-7 items-center justify-center"
                >
                  <ChevronUp
                    size={25}
                    color="#bdbdbd"
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                <Text className="text-[11px] text-gray-300">
                  {previousClose}
                </Text>

                <Text className="mt-2 text-[11px] text-gray-300">
                  {day.close === "00:00"
                    ? "23:55"
                    : minutesToTime(closeMinutes - 5)}
                </Text>

                <View className="mt-2 h-7 w-24 items-center justify-center rounded-lg border border-gray-400 bg-white">
                  <Text className="text-[11px] font-medium text-black">
                    {day.close}
                  </Text>
                </View>

                <Text className="mt-2 text-[11px] text-gray-300">
                  {nextClose}
                </Text>

                <TouchableOpacity
                  onPress={() => changeTime("close", -5)}
                  className="mt-1 h-7 items-center justify-center"
                >
                  <ChevronDown
                    size={25}
                    color="#bdbdbd"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* INTERVALOS */}
            <View className="mt-3">

              <View className="h-8 justify-center bg-[#eeeeee] px-3">
                <Text className="text-[11px] font-semibold text-black">
                  Intervalos
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  console.log("Adicionar intervalo");
                }}
                className="mx-3 flex-row items-center border-b border-gray-200 py-4"
              >
                <Plus
                  size={22}
                  color="#000"
                  strokeWidth={1.8}
                />

                <Text className="ml-3 text-[11px] text-black">
                  Adicionar intervalo
                </Text>
              </TouchableOpacity>

            </View>
          </>
        ) : (
          <View className="items-center px-5 pt-10">
            <Text className="text-[11px] text-gray-400">
              Este estabelecimento estará fechado neste dia.
            </Text>
          </View>
        )}

        {/* BOTÃO OK */}
        <View className="mt-auto px-4 pb-8">

          <TouchableOpacity
            onPress={saveDay}
            className="items-center rounded-xl bg-black py-3"
          >
            <Text className="text-[13px] font-semibold text-white">
              OK
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }

  /*
   * ==========================================
   * TELA PRINCIPAL
   * ==========================================
   */

  return (
    <View className="flex-1 bg-white">

      {/* CONTEÚDO */}
      <View className="flex-1 px-4 pt-14">

        {/* VOLTAR */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-7"
        >
          <ChevronLeft
            size={24}
            color="#000"
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* PROGRESSO */}
        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: "70%" }}
          />
        </View>

        {/* TÍTULO */}
        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">
            Seu horário de funcionamento
          </Text>

          <Text className="mt-1 text-[7px] text-gray-400">
            Quando os clientes podem reservar com você?
          </Text>
        </View>

        {/* DIAS */}
        <View className="mt-5">

          {DAYS.map((day) => {
            const dayHours = getDayHours(day);

            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                onPress={() => openDay(day)}
                className="flex-row items-center border-b border-gray-100 py-2.5"
              >
                {/* DIA */}
                <Text className="flex-1 text-[10px] text-black">
                  {day}
                </Text>

                {/* HORÁRIO */}
                <Text className="mr-2 text-[10px] text-black">
                  {dayHours.enabled
                    ? `${dayHours.open} - ${dayHours.close}`
                    : "Fechado"}
                </Text>

                <ChevronRight
                  size={17}
                  color="#000"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            );
          })}

        </View>

        {error ? (
          <Text className="mt-3 px-1 text-[9px] text-red-500">{error}</Text>
        ) : null}
      </View>

      {/* RODAPÉ */}
      <View className="px-4 pb-8">

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleContinue}
          className="items-center rounded-xl bg-black py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              Continuar
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}