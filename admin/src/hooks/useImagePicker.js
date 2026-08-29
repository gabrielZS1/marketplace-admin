import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker() {
  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para escolher uma foto."
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  }

  return { pickImage };
}