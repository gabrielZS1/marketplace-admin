import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  X,
  Bell,
  Check,
  XCircle,
  Clock,
  CalendarDays,
  UserRound,
} from "lucide-react-native";

const STATUS_CONFIG = {
  PENDING: {
    label: "Aguardando confirmação",
    color: "#F59E0B",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "#22C55E",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "#EF4444",
  },
  COMPLETED: {
    label: "Concluído",
    color: "#6366F1",
  },
  IN_PROGRESS: {
    label: "Em andamento",
    color: "#3B82F6",
  },
};

export default function NotificationsModal({
  visible,
  onClose,
  appointments,
  isLoading,
  onConfirm,
  onCancel,
  updatingId,
}) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    if (visible) {
      // Estado inicial
      overlayOpacity.setValue(0);
      translateY.setValue(80);
      scale.setValue(0.97);

      // Entrada
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 60,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(scale, {
        toValue: 0.98,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(b.startsAt).getTime() -
      new Date(a.startsAt).getTime()
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  const getStatus = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: status,
        color: "#999",
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        className="flex-1 justify-end bg-black/40"
        style={{
          opacity: overlayOpacity,
        }}
      >
        <Animated.View
          className="rounded-t-[28px] bg-white"
          style={{
            maxHeight: "88%",
            transform: [
              { translateY },
              { scale },
            ],
          }}
        >
          {/* HEADER */}

          <View className="border-b border-gray-100 px-5 pb-4 pt-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <Bell
                    size={20}
                    color="#000"
                    strokeWidth={2}
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-[17px] font-bold text-black">
                    Notificações
                  </Text>

                  <Text className="mt-0.5 text-[10px] text-gray-400">
                    Solicitações e agendamentos
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONTEÚDO */}

          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator
                size="small"
                color="#000"
              />

              <Text className="mt-3 text-[11px] text-gray-400">
                Carregando notificações...
              </Text>
            </View>
          ) : sortedAppointments.length === 0 ? (
            <View className="items-center justify-center px-8 py-14">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Bell
                  size={27}
                  color="#999"
                />
              </View>

              <Text className="mt-4 text-[14px] font-semibold text-black">
                Tudo tranquilo por aqui
              </Text>

              <Text className="mt-1 text-center text-[10px] leading-4 text-gray-400">
                Quando novos clientes fizerem agendamentos,
                eles aparecerão aqui.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 35,
              }}
            >
              {sortedAppointments.map((item) => {
                const status = getStatus(item.status);
                const isPending = item.status === "PENDING";
                const isUpdating = updatingId === item.id;

                return (
                  <View
                    key={item.id}
                    className="mb-4 rounded-2xl border border-gray-200 bg-white p-4"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 5,
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      elevation: 2,
                    }}
                  >
                    {/* TOPO */}

                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <UserRound
                              size={19}
                              color="#555"
                            />
                          </View>

                          <View className="ml-3 flex-1">
                            <Text
                              numberOfLines={1}
                              className="text-[13px] font-bold text-black"
                            >
                              {item.clientName}
                            </Text>

                            <Text
                              numberOfLines={1}
                              className="mt-0.5 text-[10px] text-gray-400"
                            >
                              {item.serviceName}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* STATUS */}

                      <View
                        className="rounded-full px-2.5 py-1"
                        style={{
                          backgroundColor: `${status.color}15`,
                        }}
                      >
                        <Text
                          className="text-[8px] font-semibold"
                          style={{
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    {/* INFORMAÇÕES */}

                    <View className="mt-4 flex-row">
                      <View className="flex-1 flex-row items-center">
                        <CalendarDays
                          size={15}
                          color="#999"
                        />

                        <Text className="ml-2 text-[10px] text-gray-500">
                          {formatDate(item.startsAt)}
                        </Text>
                      </View>

                      <View className="flex-1 flex-row items-center">
                        <Clock
                          size={15}
                          color="#999"
                        />

                        <Text className="ml-2 text-[10px] text-gray-500">
                          {formatTime(item.startsAt)}
                        </Text>
                      </View>
                    </View>

                    {/* PROFISSIONAL */}

                    <View className="mt-2 flex-row items-center">
                      <UserRound
                        size={14}
                        color="#999"
                      />

                      <Text className="ml-2 text-[10px] text-gray-500">
                        Profissional: {item.employeeName}
                      </Text>
                    </View>

                    {/* AÇÕES */}

                    {isPending && (
                      <View className="mt-4 flex-row">
                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={isUpdating}
                          onPress={() => onCancel(item.id)}
                          className="mr-2 flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 py-3"
                        >
                          {isUpdating ? (
                            <ActivityIndicator
                              size="small"
                              color="#999"
                            />
                          ) : (
                            <>
                              <XCircle
                                size={16}
                                color="#EF4444"
                              />

                              <Text className="ml-2 text-[10px] font-semibold text-red-500">
                                Recusar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={isUpdating}
                          onPress={() => onConfirm(item.id)}
                          className="flex-1 flex-row items-center justify-center rounded-xl bg-black py-3"
                        >
                          {isUpdating ? (
                            <ActivityIndicator
                              size="small"
                              color="#fff"
                            />
                          ) : (
                            <>
                              <Check
                                size={16}
                                color="#fff"
                              />

                              <Text className="ml-2 text-[10px] font-semibold text-white">
                                Confirmar
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}