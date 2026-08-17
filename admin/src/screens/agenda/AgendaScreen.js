import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Bell, Settings, ChevronDown } from "lucide-react-native";
import * as Notifications from "expo-notifications";

import { useBusinessStore } from "../../store/businessStore";
import { appointmentApi } from "../../api/appointmentApi";

import {
  getBrasiliaNow,
  getCurrentWeekDays,
  isSameDay,
} from "../../utils/dateUtils";

import {
  HOUR_HEIGHT,
  generateHourSlots,
  formatHourLabel,
  getMinutesFromStart,
  minutesToY,
} from "../../utils/timelineUtils";

import DiagonalPattern from "../../components/DiagonalPattern";
import CreateAppointmentMenu from "./CreateAppointmentMenu";
import CalendarSettingsModal from "./CalendarSettingsModal";
import NotificationsModal from "./NotificationsModal";
import DateOptionsModal from "./DateOptionsModal";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = 44;
const TIMELINE_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;

export default function AgendaScreen({ navigation }) {
  const businessId = useBusinessStore((state) => state.status?.id);

  // Estados
  const [updatingId, setUpdatingId] = useState(null);
  const [now, setNow] = useState(getBrasiliaNow());
  const [selectedDate, setSelectedDate] = useState(getBrasiliaNow());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  // Dias da semana
  const weekDays = useMemo(
    () => getCurrentWeekDays(selectedDate),
    [selectedDate]
  );

  // Horários
  const hours = useMemo(() => generateHourSlots(), []);

  // Dimensões da timeline
  const timelineHeight = hours.length * HOUR_HEIGHT;

  // Linha do horário atual
  const currentTimeY = minutesToY(getMinutesFromStart(now));

  const showCurrentTimeLine = isSameDay(now, selectedDate);

  // Atualiza o horário atual a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getBrasiliaNow());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Função reutilizável de busca dos agendamentos
  function fetchAppointments() {
    if (!businessId) return;

    appointmentApi
      .listByBusiness(businessId)
      .then(setAppointments)
      .catch((error) => {
        console.error("Erro ao carregar agendamentos:", error);
      });
  }

  // Busca os agendamentos ao montar a tela
  useEffect(() => {
    if (!businessId) return;

    setIsLoading(true);

    appointmentApi
      .listByBusiness(businessId)
      .then(setAppointments)
      .catch((error) => {
        console.error("Erro ao carregar agendamentos:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [businessId]);

  // Recarrega os agendamentos automaticamente quando uma notificação push
  // chega (cliente fez um novo agendamento), mesmo com o app já aberto
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      fetchAppointments();
    });

    return () => subscription.remove();
  }, [businessId]);

  // Agendamentos do dia selecionado
  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(new Date(appointment.startsAt), selectedDate)
  );

  // Abre o modal de notificações já recarregando os dados
  const openNotifications = () => {
    setNotificationsModalVisible(true);
    fetchAppointments();
  };

  // Confirmar agendamento
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);

      const updatedAppointment = await appointmentApi.updateStatus(
        appointmentId,
        "CONFIRMED"
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                ...updatedAppointment,
                status: "CONFIRMED",
              }
            : appointment
        )
      );
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancelar agendamento
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);

      const updatedAppointment = await appointmentApi.updateStatus(
        appointmentId,
        "CANCELLED"
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                ...updatedAppointment,
                status: "CANCELLED",
              }
            : appointment
        )
      );
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center justify-between px-6 pt-16">
        {/* Notificações */}
        <TouchableOpacity onPress={openNotifications}>
          <Bell size={28} color="#000" />
        </TouchableOpacity>

        {/* Data */}
        <TouchableOpacity
          onPress={() => setDateModalVisible(true)}
          className="flex-row items-center"
        >
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-[18px] font-semibold text-black">
                Hoje
              </Text>

              <ChevronDown size={20} color="#000" />
            </View>

            <Text className="text-[12px] text-gray-400">
              {selectedDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
              })}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Configurações */}
        <TouchableOpacity
          onPress={() => setSettingsModalVisible(true)}
        >
          <Settings size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ================= SEMANA ================= */}
      <View className="mt-6 flex-row justify-between px-6">
        {weekDays.map((day) => {
          const selected = isSameDay(day.date, selectedDate);

          return (
            <TouchableOpacity
              key={day.date.toISOString()}
              onPress={() => setSelectedDate(day.date)}
              className="items-center"
            >
              <Text className="text-[12px] text-gray-400">
                {day.label}
              </Text>

              <View
                style={{ borderRadius: 999 }}
                className={`mt-1 h-8 w-8 items-center justify-center ${
                  selected ? "bg-red-400" : ""
                }`}
              >
                <Text
                  className={`text-[12px] ${
                    selected
                      ? "font-bold text-white"
                      : "text-black"
                  }`}
                >
                  {day.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= TIMELINE ================= */}
      <ScrollView className="mt-7 flex-1">
        <View style={{ flexDirection: "row" }}>
          {/* Horários */}
          <View style={{ width: SIDEBAR_WIDTH }}>
            {hours.map((hour) => (
              <View
                key={hour}
                style={{ height: HOUR_HEIGHT }}
              >
                <Text className="pl-2 text-[11px] text-gray-400">
                  {formatHourLabel(hour)}
                </Text>
              </View>
            ))}
          </View>

          {/* Área da timeline */}
          <View
            style={{
              width: TIMELINE_WIDTH,
              height: timelineHeight,
            }}
            className="relative overflow-hidden rounded-lg"
          >
            {/* Fundo com textura */}
            <DiagonalPattern
              width={TIMELINE_WIDTH}
              height={timelineHeight}
            />

            {/* Linhas dos horários */}
            {hours.map((hour, index) => (
              <View
                key={hour}
                style={{
                  position: "absolute",
                  top: index * HOUR_HEIGHT,
                  width: TIMELINE_WIDTH,
                }}
                className="border-t border-gray-400/30"
              />
            ))}

            {/* Linha do horário atual */}
            {showCurrentTimeLine && (
              <View
                style={{
                  position: "absolute",
                  top: currentTimeY,
                  width: TIMELINE_WIDTH,
                }}
                className="flex-row items-center"
              >
                <View className="-ml-1 h-2 w-2 rounded-full bg-red-500" />

                <View className="h-[1px] flex-1 bg-red-500" />
              </View>
            )}

            {/* Agendamentos */}
            {dayAppointments.map((item) => {
              const start = new Date(item.startsAt);
              const end = new Date(item.endsAt);

              const top = minutesToY(
                getMinutesFromStart(start)
              );

              const height =
                minutesToY(getMinutesFromStart(end)) - top;

              return (
                <View
                  key={item.id}
                  style={{
                    position: "absolute",
                    top,
                    height: Math.max(height, 30),
                    left: 12,
                    right: 12,
                  }}
                  className="justify-center rounded-lg bg-[#f1cf0e] px-4 py-2"
                >
                  <Text
                    numberOfLines={1}
                    className="text-[11px] font-semibold text-white"
                  >
                    {item.clientName}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="text-[9px] text-white/80"
                  >
                    {item.serviceName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ================= MENU CRIAR ================= */}
      <CreateAppointmentMenu navigation={navigation} />

      {/* ================= CONFIGURAÇÕES ================= */}
      <CalendarSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />

      {/* ================= NOTIFICAÇÕES ================= */}
      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        appointments={appointments}
        isLoading={isLoading}
        onConfirm={handleConfirmAppointment}
        onCancel={handleCancelAppointment}
        updatingId={updatingId}
      />

      {/* ================= OPÇÕES DE DATA ================= */}
      <DateOptionsModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </View>
  );
}