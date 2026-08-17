import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react-native";

import { useBusinessStore } from "../../store/businessStore";
// import { clientApi } from "../../api/clientApi";
// import { serviceApi } from "../../api/serviceApi";
// import { appointmentApi } from "../../api/appointmentApi";

export default function CreateAppointmentScreen({ navigation, route }) {
  const businessId = useBusinessStore((state) => state.status?.id);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  /*
   * Caso a tela seja aberta passando informações,
   * podemos aproveitá-las aqui.
   */
  useEffect(() => {
    if (route?.params?.client) {
      setSelectedClient(route.params.client);
    }

    if (route?.params?.service) {
      setSelectedService(route.params.service);
    }

    if (route?.params?.startDate) {
      setStartDate(route.params.startDate);
    }

    if (route?.params?.endDate) {
      setEndDate(route.params.endDate);
    }
  }, [route?.params]);

  /*
   * Futuramente:
   *
   * carregar clientes:
   *
   * clientApi.listByBusiness(businessId)
   *
   * carregar serviços:
   *
   * serviceApi.listByBusiness(businessId)
   */

  function handleClientPress() {
    navigation.navigate("SelectClient");
  }

  function handleServicePress() {
    navigation.navigate("SelectService");
  }

  function handleStartDatePress() {
    navigation.navigate("SelectAppointmentDate", {
      type: "start",
    });
  }

  function handleEndDatePress() {
    navigation.navigate("SelectAppointmentDate", {
      type: "end",
    });
  }

  async function handleSave() {
    if (isLoading) return;

    /*
     * Aqui futuramente entra a chamada:
     *
     * appointmentApi.create({
     *   businessId,
     *   clientId: selectedClient.id,
     *   serviceId: selectedService.id,
     *   startsAt: startDate,
     *   endsAt: endDate,
     * })
     */

    try {
      setIsLoading(true);

      console.log({
        businessId,
        client: selectedClient,
        service: selectedService,
        startDate,
        endDate,
      });

      // Depois da criação:
      // navigation.goBack();

    } finally {
      setIsLoading(false);
    }
  }

  const clientName =
    selectedClient?.name ||
    "Selecione um cliente ou deixe em branco para chegada";

  const serviceName =
    selectedService?.name ||
    "Selecione o serviço";

  return (
    <View className="flex-1 bg-white">

      {/* CONTEÚDO */}
      <View className="flex-1 px-6 pt-16">

        {/* HEADER */}
        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-8"
          >
            <Text className="text-[25px] font-medium text-black">
              X
            </Text>
          </TouchableOpacity>

          <Text className="text-[18px] font-bold text-black">
            Novo agendamento
          </Text>

        </View>

        {/* CLIENTE */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClientPress}
          className="mt-8 h-[80px] flex-row items-center rounded-xl border border-gray-300 px-3"
        >

          {/* FOTO */}
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {selectedClient?.photoUrl ? (
              <View className="h-full w-full" />
            ) : (
              <UserRound
                size={29}
                color="#aaa"
              />
            )}
          </View>

          {/* TEXTO */}
          <View className="ml-3 flex-1">

            <Text
              numberOfLines={2}
              className="text-[13px] leading-4 text-gray-400"
            >
              {clientName}
            </Text>

          </View>

          <ChevronRight
            size={22}
            color="#aaa"
          />

        </TouchableOpacity>

        {/* SERVIÇO */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleServicePress}
          className="relative mt-10 h-[52px] flex-row items-center rounded-xl border border-gray-300 px-3"
        >

          {/* LABEL */}
          <View className="absolute left-3 top-[-6px] bg-white px-1">
            <Text className="text-[7px] text-gray-400">
              Serviço
            </Text>
          </View>

          <Text
            numberOfLines={1}
            className="flex-1 text-[13px] text-gray-400"
          >
            {serviceName}
          </Text>

          <ChevronRight
            size={21}
            color="#aaa"
          />

        </TouchableOpacity>

        {/* DATA E HORA */}
        <View className="mt-4 flex-row">

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

            <ChevronRight
              size={19}
              color="#aaa"
              style={{
                transform: [{ rotate: "90deg" }],
              }}
            />

          </TouchableOpacity>

          {/* ESPAÇO */}
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

            <ChevronRight
              size={19}
              color="#aaa"
              style={{
                transform: [{ rotate: "90deg" }],
              }}
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