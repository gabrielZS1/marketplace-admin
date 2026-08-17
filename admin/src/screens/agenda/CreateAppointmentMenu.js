import { useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Plus } from "lucide-react-native";

const OPTIONS = [
  { key: "appointment", label: "Novo agendamento", dark: true },
  { key: "block", label: "Novo bloqueio de horário", dark: false },
  { key: "dayoff", label: "Adicionar Folga", dark: false },
];

export default function CreateAppointmentMenu({ navigation }) {
  const [open, setOpen] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const optionsTranslateY = useRef(new Animated.Value(20)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  function toggle() {
    if (open) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(optionsTranslateY, {
          toValue: 20,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setOpen(false));
    } else {
      setOpen(true);
      overlayOpacity.setValue(0);
      optionsTranslateY.setValue(20);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(optionsTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }

  const rotateDeg = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <>
      {open && (
        <Animated.View
          pointerEvents="auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: overlayOpacity,
          }}
          className="bg-black/60"
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={toggle}
          />
        </Animated.View>
      )}

      {open && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            right: 20,
            transform: [{ translateY: optionsTranslateY }],
            opacity: overlayOpacity,
          }}
        >
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.8}
              onPress={() => {
                toggle();

                if (option.key === "block") {
                  navigation.navigate("CreateTimeBlock");
                }

                if (option.key === "appointment") {
                  navigation.navigate("CreateAppointment");
                }

                if (option.key === "dayoff") {
                  navigation.navigate("CreateDayOff");
                }
              }}
              className={`mb-3 items-center justify-center rounded-full px-5 py-3 ${
                option.dark ? "bg-neutral-800" : "bg-white"
              }`}
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              <Text
                className={`text-[12px] font-semibold ${option.dark ? "text-white" : "text-black"}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={toggle}
        className="absolute bottom-14 right-5 h-14 w-14 items-center justify-center rounded-full bg-black"
        style={{ zIndex: 10 }}
      >
        <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
          <Plus size={26} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}
