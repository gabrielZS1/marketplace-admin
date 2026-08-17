import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";

export default function AddressScreen({ navigation }) {
  const selectedAddress = useOnboardingStore((state) => state.selectedAddress);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = !!selectedAddress;

  function handleAddressPress() {
    navigation.navigate("AddressSearch");
  }

  function handleContinue() {
    if (!isValid || isLoading) return;

    setIsLoading(true);

    navigation.navigate("AddressConfirmation", {
      address: selectedAddress.address,
      city: selectedAddress.city,
      state: selectedAddress.state,
      cep: selectedAddress.cep,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    });

    setIsLoading(false);
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-7">
          <ChevronLeft size={24} color="#000" strokeWidth={2} />
        </TouchableOpacity>

        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View className="h-full rounded-full bg-green-500" style={{ width: "57%" }} />
        </View>

        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">Seu endereço</Text>
          <Text className="mt-1 text-[7px] text-gray-400">
            Onde seus clientes podem te encontrar?
          </Text>
        </View>

        <View className="mt-7 h-[422px] overflow-hidden rounded-xl bg-[#d9d9d9]">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddressPress}
            className="mx-5 mt-5 h-9 flex-row items-center justify-center rounded-md bg-white"
          >
            <MapPin size={15} color="#000" fill="#000" strokeWidth={2} />
            <Text
              numberOfLines={1}
              className="ml-1.5 max-w-[220px] text-[10px] font-semibold text-black"
            >
              {selectedAddress?.title || "Digite seu endereço"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 pb-8">
        <TouchableOpacity
          disabled={!isValid || isLoading}
          onPress={handleContinue}
          className="items-center rounded-xl bg-black py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">Continuar</Text>
          )}
        </TouchableOpacity>

        {!isValid && (
          <Text className="mt-4 text-center text-[7px] text-gray-400">
            Por favor, insira seu endereço para continuar.
          </Text>
        )}
      </View>
    </View>
  );
}