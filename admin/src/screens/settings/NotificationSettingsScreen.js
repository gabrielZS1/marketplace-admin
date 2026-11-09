import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Bell } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import Toggle from "../../components/ui/Toggle";
import Skeleton from "../../components/ui/Skeleton";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "../../utils/notificationPref";
import { registerForPushNotificationsAsync } from "../../../pushNotifications";
import { apiClient } from "../../api/client";

export default function NotificationSettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getNotificationsEnabled().then((v) => {
      setEnabled(v);
      setLoaded(true);
    });
  }, []);

  async function toggle(next) {
    setEnabled(next);
    await setNotificationsEnabled(next);
    if (next) {
      // religa: registra o token de novo neste aparelho
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await apiClient.patch("/businesses/me/push-token", { expoPushToken: token });
        }
      } catch {
        // ignore
      }
    }
  }

  return (
    <Screen navigation={navigation} title="Notificações">
      <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-4">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Bell size={18} color="#374151" strokeWidth={2} />
        </View>
        <View className="ml-3 flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-[#111827]">
            Avisos neste aparelho
          </Text>
          <Text className="mt-0.5 text-[12px] leading-4 text-gray-400">
            Receber um aviso quando um cliente fizer um novo agendamento.
          </Text>
        </View>
        {loaded ? (
          <Toggle value={enabled} onValueChange={toggle} />
        ) : (
          <Skeleton width={48} height={28} radius={999} />
        )}
      </View>

      <Text className="mt-4 text-[12px] leading-4 text-gray-400">
        Vale só para este celular. Se você usar o app em outro aparelho, ajuste a
        preferência lá também. Pode levar alguns minutos para parar de receber.
      </Text>
    </Screen>
  );
}
