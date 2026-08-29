import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Menu de ações no estilo do app (bottom sheet), no lugar do Alert cinza do Android.
 *
 * <ActionSheet
 *   visible={open}
 *   onClose={() => setOpen(false)}
 *   title="Isabella"
 *   message="O que deseja fazer?"
 *   actions={[
 *     { label: "Editar", icon: Pencil, onPress: ... },
 *     { label: "Desativar", icon: UserMinus, destructive: true, onPress: ... },
 *   ]}
 * />
 */
export default function ActionSheet({
  visible,
  onClose,
  title,
  message,
  actions = [],
}) {
  const insets = useSafeAreaInsets();
  const overlay = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      overlay.setValue(0);
      translateY.setValue(40);
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  function handleAction(action) {
    onClose?.();
    // deixa o sheet fechar antes de navegar / abrir outro alerta
    setTimeout(() => action.onPress?.(), 180);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={{ flex: 1, opacity: overlay }} className="bg-black/50">
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY }],
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-5 pt-3"
      >
        <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

        {title ? (
          <Text className="text-center text-[16px] font-bold text-[#111827]">
            {title}
          </Text>
        ) : null}
        {message ? (
          <Text className="mt-1 text-center text-[13px] text-gray-500">
            {message}
          </Text>
        ) : null}

        <View className="mt-4">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                onPress={() => handleAction(action)}
                className={`flex-row items-center rounded-2xl px-4 py-4 ${
                  i === 0 ? "" : "mt-1"
                } ${action.destructive ? "bg-red-50" : "bg-gray-50"}`}
              >
                {Icon ? (
                  <Icon
                    size={18}
                    color={action.destructive ? "#DC2626" : "#374151"}
                    strokeWidth={2}
                  />
                ) : null}
                <Text
                  className={`ml-3 text-[15px] font-semibold ${
                    action.destructive ? "text-[#DC2626]" : "text-[#111827]"
                  }`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            className="mt-2 items-center rounded-2xl px-4 py-4"
          >
            <Text className="text-[15px] font-semibold text-gray-500">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
