import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

export default function CalendarSettingsModal({ visible, onClose }) {
  const translateY = useRef(new Animated.Value(700)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 700,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && opacity.__getValue() === 0) {
    return null;
  }

  function handleOpeningDays() {
    // Futuramente:
    // navigation.navigate("OpeningDays");
  }

  function handleBusinessHours() {
    // Futuramente:
    // navigation.navigate("BusinessHours");
  }

  function handleClose() {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 700,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute inset-0"
    >
      {/* FUNDO */}
      <Animated.View
        className="absolute inset-0 bg-black"
        style={{
          opacity: opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.35],
          }),
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1"
          onPress={handleClose}
        />
      </Animated.View>

      {/* MODAL */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 min-h-[92%] rounded-t-[18px] bg-white px-[18px] pt-6"
        style={{
          transform: [{ translateY }],
        }}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-end">
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text className="text-[20px] font-semibold text-[#e0c000]">
              Concluir
            </Text>
          </TouchableOpacity>
        </View>

        {/* TÍTULO */}
        <Text className="mt-4 text-[13px] font-medium text-gray-400">
          Configurações do Calendário
        </Text>

        {/* OPÇÕES */}
        <View className="mt-7">

          {/* DIAS DE ABERTURA */}
          <TouchableOpacity
            activeOpacity={0.65}
            onPress={handleOpeningDays}
            className="border-b border-gray-200 pb-4"
          >
            <View className="flex-row items-center justify-between">

              <View className="flex-1 pr-4">

                <Text className="text-[13px] font-semibold text-black">
                  Dias de abertura e horários
                </Text>

                <Text className="mt-2 text-[12px] leading-[16px] text-gray-400">
                  Ajuste o horário de funcionamento ou adicione
                  {"\n"}
                  folgas para datas específicas.
                </Text>

              </View>

              <ChevronRight
                size={20}
                color="#aaa"
                strokeWidth={1.5}
              />

            </View>
          </TouchableOpacity>

          {/* HORÁRIO DE FUNCIONAMENTO */}
          <TouchableOpacity
            activeOpacity={0.65}
            onPress={handleBusinessHours}
            className="border-b border-gray-200 py-5"
          >
            <View className="flex-row items-center justify-between">

              <View className="flex-1 pr-4">

                <Text className="text-[13px] font-semibold text-black">
                  Horário de funcionamento
                </Text>

                <Text className="mt-2 text-[12px] leading-[16px] text-gray-400">
                  Defina um horário de funcionamento padrão
                  {"\n"}
                  aqui. Se você precisar fazer exceções para
                  {"\n"}
                  datas específicas, use os dias de abertura
                </Text>

              </View>

              <ChevronRight
                size={20}
                color="#aaa"
                strokeWidth={1.5}
              />

            </View>
          </TouchableOpacity>

        </View>
      </Animated.View>
    </View>
  );
}