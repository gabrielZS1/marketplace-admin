import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "notifications_enabled";

export async function getNotificationsEnabled() {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export async function setNotificationsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(KEY, enabled ? "true" : "false");
  } catch {
    // ignore
  }
}
