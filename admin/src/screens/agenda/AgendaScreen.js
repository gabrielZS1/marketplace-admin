import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Bell, Settings, ChevronDown, MessageCircle } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { openWhatsApp } from "../../utils/whatsapp";

import { useBusinessStore } from "../../store/businessStore";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { useIsOwner, useMyEmployeeId } from "../../hooks/useRole";
import { appointmentApi } from "../../api/appointmentApi";
import { scheduleApi } from "../../api/scheduleApi";

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

import CreateAppointmentMenu from "./CreateAppointmentMenu";
import { AgendaBlocksSkeleton } from "../../components/skeletons";


import NotificationsModal from "./NotificationsModal";
import DateOptionsModal from "./DateOptionsModal";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = 44;
const TIMELINE_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;

// Cores suaves dos cartões de agendamento. Cada serviço fica sempre com a mesma cor.
const APPT_PALETTE = [
  { bg: "#FDF3D7", accent: "#E8C15E" },
  { bg: "#E2F3E5", accent: "#8FC79C" },
  { bg: "#E0EDFA", accent: "#8FBBE6" },
  { bg: "#ECE6F6", accent: "#B6A6DE" },
  { bg: "#FBE6E4", accent: "#E6A29E" },
  { bg: "#FCEBDD", accent: "#EAB183" },
];

function apptColor(key) {
  const s = String(key || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return APPT_PALETTE[h % APPT_PALETTE.length];
}

function shortTime(d) {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AgendaScreen({ navigation }) {
  const businessId = useBusinessStore((state) => state.status?.id);
  const topPad = useContentTopPadding();
  const isOwner = useIsOwner();
  const myEmployeeId = useMyEmployeeId();
  const [onlyMine, setOnlyMine] = useState(false);

  // Estados
  const [updatingId, setUpdatingId] = useState(null);
  const [now, setNow] = useState(getBrasiliaNow());
  const [selectedDate, setSelectedDate] = useState(getBrasiliaNow());
  const [appointments, setAppointments] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  // Dias da semana
  const weekDays = useMemo(
    () => getCurrentWeekDays(selectedDate),
    [selectedDate],
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

  function fetchSchedule() {
    if (!businessId) return;
    scheduleApi.listTimeBlocks(businessId).then(setTimeBlocks).catch(() => {});
    scheduleApi.listTimeOffs(businessId).then(setTimeOffs).catch(() => {});
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

    fetchSchedule();
  }, [businessId]);

  // Recarrega ao voltar pra tela (ex: depois de criar um bloqueio/folga)
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchAppointments();
      fetchSchedule();
    });
    return unsub;
  }, [navigation, businessId]);

  // Recarrega os agendamentos automaticamente quando uma notificação push
  // chega (cliente fez um novo agendamento), mesmo com o app já aberto
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      fetchAppointments();
    });

    return () => subscription.remove();
  }, [businessId]);

  // Agendamentos do dia selecionado (funcionário pode filtrar "só os meus")
  const dayAppointments = appointments.filter(
    (appointment) =>
      isSameDay(new Date(appointment.startsAt), selectedDate) &&
      (!onlyMine || !myEmployeeId || appointment.employeeId === myEmployeeId),
  );

  // Bloqueios / folgas que tocam o dia selecionado
  function overlapsSelectedDay(startsAt, endsAt) {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    return new Date(startsAt) <= dayEnd && new Date(endsAt) >= dayStart;
  }

  const dayBlocks = timeBlocks.filter((b) =>
    overlapsSelectedDay(b.startsAt, b.endsAt),
  );
  const dayOffs = timeOffs.filter((o) =>
    overlapsSelectedDay(o.startsAt, o.endsAt),
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
        "CONFIRMED",
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                ...updatedAppointment,
                status: "CONFIRMED",
              }
            : appointment,
        ),
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
        "CANCELLED",
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                ...updatedAppointment,
                status: "CANCELLED",
              }
            : appointment,
        ),
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
      <View
        className="flex-row items-center justify-between px-6"
        style={{ paddingTop: topPad }}
      >
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
              <Text className="text-[18px] font-semibold text-black">Data</Text>

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
          onPress={() => navigation.navigate("Perfil", { screen: "Settings" })}
        >
          <Settings size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ================= SEMANA ================= */}
      <View className="mt-6 flex-row items-center justify-between px-6">
        {weekDays.map((day) => {
          const selected = isSameDay(day.date, selectedDate);

          return (
            <TouchableOpacity
              key={day.date.toISOString()}
              onPress={() => setSelectedDate(day.date)}
              activeOpacity={0.7}
              className="items-center"
            >
              <Text className="text-[12px] font-medium text-gray-400">
                {day.label}
              </Text>

              <View
                style={{
                  width: 38,
                  height: 38,
                  marginTop: 5,
                  borderRadius: 19,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selected ? "#f87171" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selected ? "700" : "500",
                    color: selected ? "#FFFFFF" : "#000000",
                  }}
                >
                  {day.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===== FILTRO "SÓ OS MEUS" (funcionário) ===== */}
      {!isOwner && myEmployeeId ? (
        <View className="mt-4 flex-row self-center rounded-full bg-gray-100 p-1">
          <TouchableOpacity
            onPress={() => setOnlyMine(false)}
            className={`rounded-full px-4 py-1.5 ${!onlyMine ? "bg-white" : ""}`}
          >
            <Text className={`text-[12px] font-semibold ${!onlyMine ? "text-[#111827]" : "text-gray-400"}`}>
              Agenda completa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setOnlyMine(true)}
            className={`rounded-full px-4 py-1.5 ${onlyMine ? "bg-white" : ""}`}
          >
            <Text className={`text-[12px] font-semibold ${onlyMine ? "text-[#111827]" : "text-gray-400"}`}>
              Só os meus
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ================= TIMELINE ================= */}
      <ScrollView className="mt-4 flex-1">
        <View style={{ flexDirection: "row" }}>
          {/* Horários */}
          <View style={{ width: SIDEBAR_WIDTH }}>
            {hours.map((hour) => (
              <View key={hour} style={{ height: HOUR_HEIGHT }}>
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
            className="relative overflow-hidden"
          >
            {/* Linhas dos horários */}
            {hours.map((hour, index) => (
              <View
                key={hour}
                style={{
                  position: "absolute",
                  top: index * HOUR_HEIGHT,
                  width: TIMELINE_WIDTH,
                }}
                className="border-t border-gray-100"
              />
            ))}

            {/* Bloqueios e folgas */}
            {[
              ...dayBlocks.map((b) => ({ ...b, kind: "block" })),
              ...dayOffs.map((o) => ({ ...o, kind: "off" })),
            ].map((item) => {
              const rawTop = minutesToY(
                getMinutesFromStart(new Date(item.startsAt)),
              );
              const rawBottom = minutesToY(
                getMinutesFromStart(new Date(item.endsAt)),
              );
              const top = Math.max(0, rawTop);
              const height = Math.max(
                24,
                Math.min(timelineHeight, rawBottom) - top,
              );
              const isBlock = item.kind === "block";
              return (
                <View
                  key={`${item.kind}-${item.id}`}
                  style={{
                    position: "absolute",
                    top,
                    height,
                    left: 0,
                    width: TIMELINE_WIDTH,
                    backgroundColor: isBlock
                      ? "rgba(17,24,39,0.10)"
                      : "rgba(180,83,9,0.10)",
                  }}
                  className="justify-center border-l-2"
                >
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: isBlock ? "#111827" : "#B45309",
                    }}
                  />
                  <Text
                    numberOfLines={1}
                    className="px-3 text-[10px] font-semibold"
                    style={{ color: isBlock ? "#111827" : "#B45309" }}
                  >
                    {isBlock
                      ? item.reason || "Estabelecimento fechado"
                      : `Folga · ${item.employeeName}${item.reason ? " — " + item.reason : ""}`}
                  </Text>
                </View>
              );
            })}

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
            {isLoading ? <AgendaBlocksSkeleton hourHeight={HOUR_HEIGHT} /> : null}
            {!isLoading && dayAppointments.map((item) => {
              const start = new Date(item.startsAt);
              const end = new Date(item.endsAt);

              const top = minutesToY(getMinutesFromStart(start));
              const rawH = minutesToY(getMinutesFromStart(end)) - top;
              const blockH = Math.max(rawH - 5, 36);

              const c = apptColor(item.serviceName || item.serviceId);
              const cancelled = item.status === "CANCELLED";
              const showService = blockH >= 58;
              const showWhatsApp = blockH >= 40 && !!item.clientPhone && !cancelled;

              return (
                <View
                  key={item.id}
                  style={{
                    position: "absolute",
                    top,
                    height: blockH,
                    left: 8,
                    right: 8,
                    backgroundColor: c.bg,
                    borderLeftWidth: 3,
                    borderLeftColor: c.accent,
                    opacity: cancelled ? 0.45 : 1,
                  }}
                  className="overflow-hidden rounded-lg"
                >
                  <View className="flex-1 justify-center px-3 py-1">
                    <Text numberOfLines={1} className="text-[11px] text-gray-400">
                      {shortTime(start)} – {shortTime(end)}
                    </Text>

                    <Text
                      numberOfLines={1}
                      className="mt-0.5 pr-5 text-[14px] font-semibold text-[#27272A]"
                      style={cancelled ? { textDecorationLine: "line-through" } : null}
                    >
                      {item.clientName || "Cliente"}
                    </Text>

                    {showService ? (
                      <Text numberOfLines={1} className="mt-0.5 text-[11px] text-gray-400">
                        {item.serviceName}
                      </Text>
                    ) : null}
                  </View>

                  {showWhatsApp ? (
                    <TouchableOpacity
                      onPress={() =>
                        openWhatsApp(
                          item.clientPhone,
                          `Olá, ${item.clientName || ""}! Aqui é do estabelecimento, sobre seu agendamento de ${item.serviceName} às ${shortTime(start)}.`,
                        )
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{ position: "absolute", top: 6, right: 6 }}
                      className="h-6 w-6 items-center justify-center rounded-full bg-white"
                    >
                      <MessageCircle size={14} color="#25D366" strokeWidth={2.2} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ================= MENU CRIAR ================= */}
      {isOwner ? <CreateAppointmentMenu navigation={navigation} /> : null}

      {/* ================= CONFIGURAÇÕES ================= */}

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
