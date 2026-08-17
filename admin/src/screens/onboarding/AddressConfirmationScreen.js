import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, X } from "lucide-react-native";

export default function AddressConfirmationScreen({ navigation, route }) {
  const params = route?.params || {};

  const [street, setStreet] = useState(params.address || "");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState(params.city || "");
  const [state, setState] = useState(params.state || "");
  const [cep, setCep] = useState(params.cep || "");

  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    street.trim().length > 0 &&
    city.trim().length > 0 &&
    cep.trim().length > 0;

  async function handleContinue() {
    if (!isValid || isLoading) return;

    try {
      setIsLoading(true);

      const addressData = {
        address: street.trim(),
        complement: complement.trim(),
        city: city.trim(),
        state: state.trim(),
        cep: cep.trim(),
        latitude: params.latitude,
        longitude: params.longitude,
      };

      console.log("========== ENDEREÇO CONFIRMADO ==========");
      console.log(addressData);
      console.log("==========================================");

      navigation.navigate("LocationConfirmation", addressData);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">

      {/* CONTEÚDO */}
      <View className="flex-1 px-4 pt-14">

        {/* VOLTAR */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-7"
        >
          <ChevronLeft
            size={24}
            color="#000"
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* PROGRESSO */}
        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: "69%" }}
          />
        </View>

        {/* TÍTULO */}
        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">
            Confirmar o seu endereço
          </Text>

          <Text className="mt-1 text-[7px] text-gray-400">
            Onde seus clientes podem te encontrar?
          </Text>
        </View>

        {/* RUA E NÚMERO */}
        <View className="relative mt-6">

          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] font-medium text-black">
              RUA E NÚMERO
            </Text>
          </View>

          <TextInput
            value={street}
            onChangeText={setStreet}
            placeholder="Digite sua rua e número"
            placeholderTextColor="#999"
            className="h-11 rounded-xl border-2 border-black px-3 pr-10 text-[10px] font-semibold text-black"
          />

          {street.length > 0 && (
            <TouchableOpacity
              onPress={() => setStreet("")}
              className="absolute right-3 top-3"
            >
              <X
                size={15}
                color="#000"
                strokeWidth={2}
              />
            </TouchableOpacity>
          )}

        </View>

        {/* COMPLEMENTO */}
        <View className="mt-3">
          <TextInput
            value={complement}
            onChangeText={setComplement}
            placeholder="Complemento"
            placeholderTextColor="#999"
            className="h-11 rounded-xl border border-gray-200 px-3 text-[10px] text-black"
          />
        </View>

        {/* CIDADE */}
        <View className="relative mt-3">

          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] text-gray-400">
              CIDADE
            </Text>
          </View>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Cidade"
            placeholderTextColor="#999"
            className="h-11 rounded-xl border border-gray-200 px-3 text-[10px] font-semibold text-black"
          />

        </View>

        {/* ESTADO */}
        <View className="relative mt-3">

          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] text-gray-400">
              ESTADO
            </Text>
          </View>

          <TextInput
            value={state}
            onChangeText={setState}
            placeholder="Estado"
            placeholderTextColor="#999"
            className="h-11 rounded-xl border border-gray-200 px-3 text-[10px] font-semibold text-black"
          />

        </View>

        {/* CEP */}
        <View className="relative mt-3">

          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] text-gray-400">
              CEP
            </Text>
          </View>

          <TextInput
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
            maxLength={9}
            placeholder="00000-000"
            placeholderTextColor="#999"
            className="h-11 rounded-xl border border-gray-200 px-3 text-[10px] font-semibold text-black"
          />

        </View>

      </View>

      {/* RODAPÉ */}
      <View className="px-4 pb-8">

        <TouchableOpacity
          disabled={!isValid || isLoading}
          onPress={handleContinue}
          className={`items-center rounded-xl py-3 ${
            !isValid ? "bg-gray-300" : "bg-black"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              Continuar
            </Text>
          )}
        </TouchableOpacity>

        {!isValid && (
          <Text className="mt-4 text-center text-[7px] text-gray-400">
            Preencha os dados do endereço para continuar.
          </Text>
        )}

      </View>

    </View>
  );
}