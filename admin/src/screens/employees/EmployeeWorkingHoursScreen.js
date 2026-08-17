import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeft, Clock, Check } from "lucide-react-native";

import {
  getEmployeeWorkingHours,
  updateEmployeeWorkingHours,
} from "../../api/workingHourApi";

const DAYS = [
  { id: 1, name: "Segunda-feira", short: "SEG" },
  { id: 2, name: "Terça-feira", short: "TER" },
  { id: 3, name: "Quarta-feira", short: "QUA" },
  { id: 4, name: "Quinta-feira", short: "QUI" },
  { id: 5, name: "Sexta-feira", short: "SEX" },
  { id: 6, name: "Sábado", short: "SÁB" },
  { id: 0, name: "Domingo", short: "DOM" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

export default function EmployeeWorkingHoursScreen({
  navigation,
  route,
}) {
  const employeeId = route?.params?.employeeId;
  const employeeName = route?.params?.employeeName || "Funcionário";

  const [days, setDays] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWorkingHours();
  }, [employeeId]);

  async function loadWorkingHours() {
    if (!employeeId) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o funcionário."
      );

      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response =
        await getEmployeeWorkingHours(employeeId);

      const formattedDays = {};

      response.forEach((hour) => {
        formattedDays[hour.dayOfWeek] = {
          enabled: true,
          startTime: hour.startTime?.slice(0, 5) || DEFAULT_START,
          endTime: hour.endTime?.slice(0, 5) || DEFAULT_END,
        };
      });

      DAYS.forEach((day) => {
        if (!formattedDays[day.id]) {
          formattedDays[day.id] = {
            enabled: false,
            startTime: DEFAULT_START,
            endTime: DEFAULT_END,
          };
        }
      });

      setDays(formattedDays);
    } catch (error) {
      console.log(
        "Erro ao carregar horários:",
        error
      );

      Alert.alert(
        "Erro",
        error?.message ||
          "Não foi possível carregar os horários."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleDay(dayId) {
    setDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        enabled: !current[dayId]?.enabled,
      },
    }));
  }

  function changeStartTime(dayId, value) {
    setDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        startTime: value,
      },
    }));
  }

  function changeEndTime(dayId, value) {
    setDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        endTime: value,
      },
    }));
  }

  function validateTime(time) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  }

  async function handleSave() {
    try {
      setIsSaving(true);

      const workingHours = [];

      for (const day of DAYS) {
        const config = days[day.id];

        if (!config?.enabled) {
          continue;
        }

        if (
          !validateTime(config.startTime) ||
          !validateTime(config.endTime)
        ) {
          Alert.alert(
            "Horário inválido",
            `Informe horários válidos para ${day.name}.`
          );

          setIsSaving(false);
          return;
        }

        if (
          timeToMinutes(config.endTime) <=
          timeToMinutes(config.startTime)
        ) {
          Alert.alert(
            "Horário inválido",
            `O horário final deve ser maior que o inicial em ${day.name}.`
          );

          setIsSaving(false);
          return;
        }

        workingHours.push({
          dayOfWeek: day.id,
          startTime: config.startTime,
          endTime: config.endTime,
        });
      }

      await updateEmployeeWorkingHours(
        employeeId,
        workingHours
      );

      Alert.alert(
        "Horários salvos",
        `Os horários de ${employeeName} foram atualizados com sucesso.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "Erro ao salvar horários:",
        error
      );

      Alert.alert(
        "Erro",
        error?.message ||
          "Não foi possível salvar os horários."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="small"
          color="#000"
        />

        <Text className="mt-3 text-[11px] text-gray-400">
          Carregando horários...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      {/* HEADER */}

      <View className="px-5 pb-4 pt-14">

        <View className="flex-row items-center">

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            className="mr-4 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft
              size={19}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View className="flex-1">

            <Text className="text-[21px] font-bold text-black">
              Horário de trabalho
            </Text>

            <Text className="mt-0.5 text-[10px] text-gray-400">
              Configure os dias e horários de {employeeName}
            </Text>

          </View>

        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >

        {/* ÍCONE */}

        <View className="mt-5 items-center">

          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">

            <Clock
              size={28}
              color="#555"
              strokeWidth={1.7}
            />

          </View>

          <Text className="mt-3 text-[11px] font-medium text-gray-500">
            Disponibilidade profissional
          </Text>

          <Text className="mt-1 text-center text-[9px] leading-4 text-gray-400">
            Os clientes poderão agendar apenas dentro
            {"\n"}
            dos horários configurados abaixo.
          </Text>

        </View>

        {/* DIAS */}

        <View className="mt-8">

          {DAYS.map((day) => {

            const config = days[day.id];

            const enabled =
              config?.enabled === true;

            return (
              <View
                key={day.id}
                className={`mb-3 rounded-2xl border ${
                  enabled
                    ? "border-gray-300 bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >

                {/* LINHA PRINCIPAL */}

                <View className="flex-row items-center px-4 py-4">

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      toggleDay(day.id)
                    }
                    className={`mr-3 h-7 w-7 items-center justify-center rounded-full border ${
                      enabled
                        ? "border-black bg-black"
                        : "border-gray-300 bg-white"
                    }`}
                  >

                    {enabled && (
                      <Check
                        size={15}
                        color="#fff"
                        strokeWidth={3}
                      />
                    )}

                  </TouchableOpacity>

                  <View className="flex-1">

                    <Text
                      className={`text-[13px] font-semibold ${
                        enabled
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    >
                      {day.name}
                    </Text>

                    <Text className="mt-0.5 text-[8px] text-gray-400">
                      {enabled
                        ? "Dia de trabalho"
                        : "Folga"}
                    </Text>

                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      toggleDay(day.id)
                    }
                    className={`rounded-full px-3 py-1 ${
                      enabled
                        ? "bg-black"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-[8px] font-semibold ${
                        enabled
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {enabled
                        ? "TRABALHA"
                        : "FOLGA"}
                    </Text>
                  </TouchableOpacity>

                </View>

                {/* HORÁRIOS */}

                {enabled && (
                  <View className="border-t border-gray-100 px-4 pb-4 pt-3">

                    <View className="flex-row items-center">

                      {/* INÍCIO */}

                      <View className="flex-1">

                        <Text className="mb-2 text-[9px] font-semibold text-gray-500">
                          INÍCIO
                        </Text>

                        <TimeInput
                          value={config.startTime}
                          onChange={(value) =>
                            changeStartTime(
                              day.id,
                              value
                            )
                          }
                        />

                      </View>

                      <Text className="mx-3 mt-5 text-[11px] text-gray-400">
                        até
                      </Text>

                      {/* FIM */}

                      <View className="flex-1">

                        <Text className="mb-2 text-[9px] font-semibold text-gray-500">
                          FIM
                        </Text>

                        <TimeInput
                          value={config.endTime}
                          onChange={(value) =>
                            changeEndTime(
                              day.id,
                              value
                            )
                          }
                        />

                      </View>

                    </View>

                  </View>
                )}

              </View>
            );
          })}

        </View>

        {/* AVISO */}

        <View className="mt-2 rounded-2xl bg-gray-50 p-4">

          <Text className="text-[10px] leading-4 text-gray-500">
            Quando um dia estiver marcado como folga,
            o funcionário não receberá agendamentos
            nesse dia. Os horários específicos do
            profissional têm prioridade sobre o horário
            geral da empresa.
          </Text>

        </View>

        {/* BOTÃO */}

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSaving}
          onPress={handleSave}
          className={`mt-6 h-[52px] items-center justify-center rounded-xl ${
            isSaving
              ? "bg-gray-300"
              : "bg-black"
          }`}
        >

          {isSaving ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Text className="text-[12px] font-semibold text-white">
              SALVAR HORÁRIOS
            </Text>
          )}

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

/**
 * Campo de horário.
 *
 * O usuário pode digitar:
 * 0900
 * 09:00
 * 930
 * 9:30
 *
 * e o componente tenta manter o formato HH:MM.
 */
function TimeInput({ value, onChange }) {

  function handleChange(text) {
    let numbers = text
      .replace(/\D/g, "")
      .slice(0, 4);

    if (numbers.length <= 2) {
      onChange(numbers);
      return;
    }

    numbers =
      numbers.slice(0, 2) +
      ":" +
      numbers.slice(2);

    onChange(numbers);
  }

  return (
    <View className="h-[48px] flex-row items-center rounded-xl border border-gray-200 px-4">

      <Clock
        size={15}
        color="#999"
        strokeWidth={1.8}
      />

      <TextInput
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        maxLength={5}
        placeholder="09:00"
        placeholderTextColor="#aaa"
        className="ml-2 flex-1 text-[13px] font-medium text-black"
      />

    </View>
  );
}