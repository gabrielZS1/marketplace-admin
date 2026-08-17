import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronDown,
  X,
} from "lucide-react-native";

export default function CreateTimeBlockScreen({ navigation }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    startTime.trim().length > 0 &&
    endTime.trim().length > 0;

  async function handleSave() {
    if (!isValid || isLoading) return;

    try {
      setIsLoading(true);

      const blockData = {
        startTime,
        endTime,
        reason: reason.trim() || null,
      };

      console.log("Novo bloqueio:", blockData);

      /*
       * Futuramente:
       *
       * await appointmentApi.createTimeBlock(blockData);
       *
       * O backend deverá salvar:
       * - businessId
       * - startTime
       * - endTime
       * - reason
       */

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartTime() {
    // Futuramente abrir seletor de horário
    console.log("Selecionar horário inicial");
  }

  function handleEndTime() {
    // Futuramente abrir seletor de horário
    console.log("Selecionar horário final");
  }

  return (
    <View className="flex-1 bg-white px-5 pt-14">

      {/* HEADER */}
      <View className="flex-row items-center">

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="mr-5"
        >
          <X
            size={24}
            color="#000"
            strokeWidth={2}
          />
        </TouchableOpacity>

        <Text className="text-[18px] font-bold text-black">
          Novo bloqueio de horário
        </Text>

      </View>

      {/* HORÁRIOS */}
      <View className="mt-8 flex-row">

        {/* INÍCIO */}
        <View className="mr-3 flex-1">

          <View className="relative">

            {/* LABEL */}
            <View className="absolute left-3 top-[-6px] z-10 bg-white px-1">
              <Text className="text-[7px] text-gray-400">
                INÍCIO
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartTime}
              className="h-14 flex-row items-center justify-between rounded-xl border border-gray-200 px-3"
            >
              <Text
                className={
                  startTime
                    ? "text-[13px] font-medium text-black"
                    : "text-[13px] text-gray-400"
                }
              >
                {startTime || "Selecionar horário"}
              </Text>

              <ChevronDown
                size={18}
                color="#999"
                strokeWidth={1.8}
              />
            </TouchableOpacity>

          </View>

        </View>

        {/* FIM */}
        <View className="flex-1">

          <View className="relative">

            {/* LABEL */}
            <View className="absolute left-3 top-[-6px] z-10 bg-white px-1">
              <Text className="text-[7px] text-gray-400">
                FIM
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleEndTime}
              className="h-14 flex-row items-center justify-between rounded-xl border border-gray-200 px-3"
            >
              <Text
                className={
                  endTime
                    ? "text-[13px] font-medium text-black"
                    : "text-[13px] text-gray-400"
                }
              >
                {endTime || "Selecionar horário"}
              </Text>

              <ChevronDown
                size={18}
                color="#999"
                strokeWidth={1.8}
              />
            </TouchableOpacity>

          </View>

        </View>

      </View>

      {/* MOTIVO */}
      <View className="mt-5">

        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Motivo"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          className="min-h-[54px] rounded-xl border border-gray-200 px-3 py-4 text-[13px] text-black"
        />

      </View>

      {/* ESPAÇO */}
      <View className="flex-1" />

      {/* RODAPÉ */}
      <View className="flex-row items-center pb-8">

        {/* CANCELAR */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          className="mr-4 h-12 flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white"
        >
          <Text className="text-[13px] font-semibold text-black">
            CANCELAR
          </Text>
        </TouchableOpacity>

        {/* SALVAR */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!isValid || isLoading}
          onPress={handleSave}
          className={`h-12 flex-1 items-center justify-center rounded-xl ${
            isValid ? "bg-black" : "bg-gray-300"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              SALVAR
            </Text>
          )}
        </TouchableOpacity>

      </View>

    </View>
  );
}