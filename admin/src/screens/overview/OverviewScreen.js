import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  UsersRound,
  UserRound,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react-native";

import { getEmployees } from "../../api/employeeApi";
import { apiClient } from "../../api/client";

export default function OverviewScreen({ navigation, route }) {
  const businessId = route?.params?.businessId;

  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData() {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      const [appointmentsResponse, employeesResponse] =
        await Promise.all([
          apiClient.get(`/appointments/business/${businessId}`),
          getEmployees(businessId),
        ]);

      setAppointments(appointmentsResponse.data || []);
      setEmployees(employeesResponse || []);
    } catch (error) {
      console.log(
        "Erro ao carregar visão geral:",
        error
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [businessId]);

  function handleRefresh() {
    setIsRefreshing(true);
    loadData();
  }

  const today = new Date();

  const todayAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const date = new Date(appointment.startsAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
  }, [appointments]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "PENDING"
    );
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => {
        const date = new Date(appointment.startsAt);

        return (
          date >= now &&
          appointment.status !== "CANCELLED" &&
          appointment.status !== "COMPLETED"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() -
          new Date(b.startsAt).getTime()
      )
      .slice(0, 5);
  }, [appointments]);

  const confirmedToday = todayAppointments.filter(
    (appointment) =>
      appointment.status === "CONFIRMED"
  ).length;

  function formatTime(date) {
    return new Date(date).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      }
    );
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        timeZone: "America/Sao_Paulo",
      }
    );
  }

  function getStatusLabel(status) {
    const statuses = {
      PENDING: "Aguardando",
      CONFIRMED: "Confirmado",
      CANCELLED: "Cancelado",
      COMPLETED: "Concluído",
      IN_PROGRESS: "Em andamento",
    };

    return statuses[status] || status;
  }

  function getStatusColor(status) {
    const colors = {
      PENDING: "#F59E0B",
      CONFIRMED: "#22C55E",
      CANCELLED: "#EF4444",
      COMPLETED: "#6366F1",
      IN_PROGRESS: "#3B82F6",
    };

    return colors[status] || "#999";
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="small"
          color="#000"
        />

        <Text className="mt-3 text-[11px] text-gray-400">
          Carregando visão geral...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#000"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 55,
          paddingBottom: 35,
        }}
      >
        {/* HEADER */}

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] text-gray-400">
              Visão geral
            </Text>

            <Text className="mt-1 text-[23px] font-bold text-black">
              Seu negócio
            </Text>

            <Text className="mt-1 text-[10px] text-gray-400">
              {today.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </Text>
          </View>

          <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
            <CalendarDays
              size={20}
              color="#000"
              strokeWidth={1.8}
            />
          </View>
        </View>

        {/* RESUMO */}

        <View className="mt-7 flex-row">
          {/* AGENDAMENTOS */}

          <View className="mr-3 flex-1 rounded-2xl bg-black p-4">
            <View className="flex-row items-center justify-between">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <CalendarDays
                  size={16}
                  color="#fff"
                />
              </View>

              <Text className="text-[9px] text-gray-400">
                HOJE
              </Text>
            </View>

            <Text className="mt-5 text-[27px] font-bold text-white">
              {todayAppointments.length}
            </Text>

            <Text className="mt-0.5 text-[10px] text-gray-400">
              agendamentos
            </Text>
          </View>

          {/* PENDENTES */}

          <View className="flex-1 rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle
                  size={16}
                  color="#F59E0B"
                />
              </View>

              <Text className="text-[9px] text-gray-400">
                PENDENTES
              </Text>
            </View>

            <Text className="mt-5 text-[27px] font-bold text-black">
              {pendingAppointments.length}
            </Text>

            <Text className="mt-0.5 text-[10px] text-gray-400">
              aguardando confirmação
            </Text>
          </View>
        </View>

        {/* SEGUNDO RESUMO */}

        <View className="mt-3 flex-row">
          {/* CONFIRMADOS */}

          <View className="mr-3 flex-1 rounded-2xl border border-gray-200 p-4">
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2
                  size={16}
                  color="#22C55E"
                />
              </View>

              <View className="ml-3">
                <Text className="text-[20px] font-bold text-black">
                  {confirmedToday}
                </Text>

                <Text className="text-[9px] text-gray-400">
                  confirmados hoje
                </Text>
              </View>
            </View>
          </View>

          {/* FUNCIONÁRIOS */}

          <View className="flex-1 rounded-2xl border border-gray-200 p-4">
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <UsersRound
                  size={16}
                  color="#555"
                />
              </View>

              <View className="ml-3">
                <Text className="text-[20px] font-bold text-black">
                  {employees.length}
                </Text>

                <Text className="text-[9px] text-gray-400">
                  profissionais ativos
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PRÓXIMOS */}

        <View className="mt-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[16px] font-bold text-black">
                Próximos atendimentos
              </Text>

              <Text className="mt-1 text-[10px] text-gray-400">
                Seus próximos agendamentos
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("Agendamento")
              }
              className="flex-row items-center"
            >
              <Text className="text-[10px] font-semibold text-black">
                Ver todos
              </Text>

              <ChevronRight
                size={15}
                color="#000"
              />
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length === 0 ? (
            <View className="mt-4 items-center rounded-2xl bg-gray-50 px-6 py-9">
              <Clock3
                size={25}
                color="#999"
              />

              <Text className="mt-3 text-[12px] font-semibold text-black">
                Nenhum atendimento próximo
              </Text>

              <Text className="mt-1 text-center text-[10px] leading-4 text-gray-400">
                Os próximos agendamentos aparecerão
                aqui.
              </Text>
            </View>
          ) : (
            <View className="mt-4">
              {upcomingAppointments.map(
                (appointment, index) => {
                  const statusColor =
                    getStatusColor(
                      appointment.status
                    );

                  return (
                    <View
                      key={appointment.id}
                      className={`rounded-2xl border border-gray-200 p-4 ${
                        index !==
                        upcomingAppointments.length - 1
                          ? "mb-3"
                          : ""
                      }`}
                    >
                      <View className="flex-row items-center">
                        {/* CLIENTE */}

                        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <UserRound
                            size={18}
                            color="#777"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-[12px] font-bold text-black"
                          >
                            {appointment.clientName}
                          </Text>

                          <Text
                            numberOfLines={1}
                            className="mt-0.5 text-[10px] text-gray-400"
                          >
                            {appointment.serviceName}
                          </Text>
                        </View>

                        {/* HORÁRIO */}

                        <View className="items-end">
                          <Text className="text-[13px] font-bold text-black">
                            {formatTime(
                              appointment.startsAt
                            )}
                          </Text>

                          <Text className="mt-0.5 text-[9px] text-gray-400">
                            {formatDate(
                              appointment.startsAt
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* RODAPÉ */}

                      <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
                        <View className="flex-row items-center">
                          <UsersRound
                            size={13}
                            color="#999"
                          />

                          <Text className="ml-2 text-[9px] text-gray-500">
                            {appointment.employeeName}
                          </Text>
                        </View>

                        <View
                          className="rounded-full px-2.5 py-1"
                          style={{
                            backgroundColor: `${statusColor}15`,
                          }}
                        >
                          <Text
                            className="text-[8px] font-semibold"
                            style={{
                              color: statusColor,
                            }}
                          >
                            {getStatusLabel(
                              appointment.status
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          )}
        </View>

        {/* AÇÕES RÁPIDAS */}

        <View className="mt-8">
          <Text className="text-[16px] font-bold text-black">
            Ações rápidas
          </Text>

          <View className="mt-4 flex-row">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Agendamento")
              }
              className="mr-3 flex-1 rounded-2xl bg-gray-50 p-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                <Plus
                  size={18}
                  color="#000"
                />
              </View>

              <Text className="mt-4 text-[11px] font-semibold text-black">
                Novo agendamento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate("Funcionarios")
              }
              className="flex-1 rounded-2xl bg-gray-50 p-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                <UsersRound
                  size={18}
                  color="#000"
                />
              </View>

              <Text className="mt-4 text-[11px] font-semibold text-black">
                Gerenciar equipe
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}