import { Linking, Alert } from "react-native";
import { phoneDigits } from "./phone";

/**
 * Abre uma conversa no WhatsApp com o número informado.
 * Assume DDD + número brasileiro (10 ou 11 dígitos) e usa o código do país 55.
 */
export async function openWhatsApp(phone, message) {
  const digits = phoneDigits(phone);

  if (digits.length < 10) {
    Alert.alert(
      "Sem telefone",
      "Esse cliente não tem um telefone válido cadastrado.",
    );
    return;
  }

  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  const url = `https://wa.me/${withCountryCode}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Não foi possível abrir o WhatsApp", "Verifique se ele está instalado no aparelho.");
  }
}
