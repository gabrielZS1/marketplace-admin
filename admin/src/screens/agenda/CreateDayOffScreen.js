import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react-native";

import { useBusinessStore } from "../../store/businessStore";

export default function CreateDayOffScreen({ navigation, route }) {
  const businessId = useBusinessStore((state) => state.status?.id);

  const [selectedEmployee, setSelectedEmployee] = useState(
    route?.params?.employee || null
  );

  const [reason, setReason] = useState("");
  const [allDay, setAllDay] = useState(true);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.employee) {
      setSelectedEmployee(route.params.employee);
    }

    if (route?.params?.reason) {
      setReason(route.params.reason);
    }

    if (route?.params?.startDate) {
      setStartDate(route.params.startDate);
    }

    if (route?.params?.endDate) {
      setEndDate(route.params.endDate);
    }
  }, [route?.params]);

  function handleEmployeePress() {
    navigation.navigate("SelectEmployee", {
      returnTo: "CreateDayOff",
    });
  }

  function handleReasonPress() {
    // Futuramente pode abrir uma lista de motivos
  }

  function handleStartDatePress() {
    navigation.navigate("SelectDayOffDate", {
      type: "start",
    });
  }

  function handleEndDatePress() {
    navigation.navigate("SelectDayOffDate", {
      type: "end",
    });
  }

  async function handleSave() {
    if (isLoading) return;

    try {
      setIsLoading(true);

      /*
       * Futuramente será feita a chamada para a API:
       *
       * dayOffApi.create({
       *   businessId,
       *   employeeId: selectedEmployee?.id,
       *   reason,
       *   allDay,
       *   startsAt: startDate,
       *   endsAt: endDate,
       * });
       */

      console.log({
        businessId,
        employee: selectedEmployee,
        reason,
        allDay,
        startDate,
        endDate,
      });

      // Depois de salvar:
      // navigation.goBack();

    } finally {
      setIsLoading(false);
    }
  }

  const employeeName =
    selectedEmployee?.name || "Selecione o funcionário";

  return (
    <View className="flex-1 bg-white">

      {/* CONTEÚDO */}
      <View className="flex-1 px-6 pt-16">

        {/* HEADER */}
        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ArrowLeft
              size={27}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <Text className="text-[18px] font-bold text-black">
            Adicionar folga
          </Text>

        </View>

        {/* FUNCIONÁRIO */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleEmployeePress}
          className="relative mt-8 h-[52px] flex-row items-center rounded-xl border border-gray-300 bg-gray-100 px-3"
        >

          {/* LABEL */}
          <View className="absolute left-3 top-[-6px] bg-white px-1">
            <Text className="text-[7px] text-gray-500">
              Funcionário
            </Text>
          </View>

          <Text
            numberOfLines={1}
            className="flex-1 text-[13px] font-medium text-gray-500"
          >
            {employeeName}
          </Text>

          <ChevronDown
            size={20}
            color="#aaa"
          />

        </TouchableOpacity>

        {/* MOTIVO */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleReasonPress}
          className="relative mt-4 h-[52px] flex-row items-center rounded-xl border border-gray-300 px-3"
        >

          {/* LABEL */}
          <View className="absolute left-3 top-[-6px] bg-white px-1">
            <Text className="text-[7px] text-gray-400">
              Serviço
            </Text>
          </View>

          <Text
            className={`flex-1 text-[13px] ${
              reason ? "text-black" : "text-gray-400"
            }`}
          >
            {reason || "Motivo"}
          </Text>

          <ChevronDown
            size={20}
            color="#aaa"
          />

        </TouchableOpacity>

        {/* TODO O DIA */}
        <View className="mt-6">

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAllDay(!allDay)}
            className="flex-row items-center"
          >

            <View
              className={`h-8 w-8 items-center justify-center rounded-lg ${
                allDay ? "bg-[#292929]" : "border border-gray-300 bg-white"
              }`}
            >
              {allDay && (
                <Check
                  size={22}
                  color="#fff"
                  strokeWidth={2.5}
                />
              )}
            </View>

            <Text className="ml-4 text-[14px] font-semibold text-black">
              Todo o dia
            </Text>

          </TouchableOpacity>

          <View className="mt-4 h-[1px] bg-gray-100" />

        </View>

        {/* DATA E HORA */}
        <View className="mt-6 flex-row">

          {/* INÍCIO */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleStartDatePress}
            className="relative h-[52px] flex-1 flex-row items-center rounded-xl border border-gray-300 px-3"
          >

            <View className="absolute left-3 top-[-6px] bg-white px-1">
              <Text className="text-[6px] text-gray-400">
                DATA E HORA
              </Text>
            </View>

            <Text
              numberOfLines={1}
              className="flex-1 text-[10px] font-medium text-black"
            >
              {startDate
                ? new Date(startDate).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Hoje • 11:45 PM"}
            </Text>

            <ChevronDown
              size={19}
              color="#aaa"
            />

          </TouchableOpacity>

          <View className="w-4" />

          {/* FIM */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEndDatePress}
            className="relative h-[52px] w-[108px] flex-row items-center rounded-xl border border-gray-300 px-3"
          >

            <View className="absolute left-3 top-[-6px] bg-white px-1">
              <Text className="text-[6px] text-gray-400">
                FIM
              </Text>
            </View>

            <Text
              numberOfLines={1}
              className="flex-1 text-[10px] font-medium text-black"
            >
              {endDate
                ? new Date(endDate).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "12:05 PM"}
            </Text>

            <ChevronDown
              size={19}
              color="#aaa"
            />

          </TouchableOpacity>

        </View>

      </View>

      {/* RODAPÉ */}
      <View className="px-4 pb-8">

        <TouchableOpacity
          disabled={isLoading}
          onPress={handleSave}
          className="items-center rounded-xl bg-[#292929] py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-bold text-white">
              SALVAR
            </Text>
          )}
        </TouchableOpacity>

      </View>

    </View>
  );
}