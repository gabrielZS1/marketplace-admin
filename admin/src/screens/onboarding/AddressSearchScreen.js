import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, Search, MapPin } from "lucide-react-native";
import { geocodingApi } from "../../api/geocodingApi";
import { useOnboardingStore } from "../../store/onboardingStore";

export default function AddressSearchScreen({ navigation }) {
  const setSelectedAddress = useOnboardingStore((state) => state.setSelectedAddress);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (search.trim().length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await geocodingApi.search(search);
        setResults(data);
      } catch (err) {
        setError("Não foi possível buscar o endereço agora.");
      } finally {
        setIsSearching(false);
      }
    }, 600); // respeita o limite de 1 req/seg do Nominatim

    return () => clearTimeout(timeout);
  }, [search]);

  function handleContinue() {
    if (!selected || isLoading) return;
    setSelectedAddress(selected);
    navigation.goBack();
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
          <Text className="text-[16px] font-semibold text-black">Digite seu endereço</Text>
          <Text className="mt-1 text-[7px] text-gray-400">Onde seus clientes podem te encontrar?</Text>
        </View>

        <View className="mt-4 flex-row items-center">
          <View className="h-9 flex-1 flex-row items-center rounded-xl bg-[#d9d9d9] px-3">
            <Search size={17} color="#aaa" strokeWidth={2} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              autoFocus
              placeholder="Pesquisar rua e número..."
              placeholderTextColor="#999"
              className="ml-2 flex-1 text-[10px] text-black"
            />
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()} className="ml-3">
            <Text className="text-[9px] font-medium text-black">Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          {isSearching ? <ActivityIndicator className="mt-4" color="#000" /> : null}

          {!isSearching &&
            results.map((item, index) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => setSelected(item)}
                  className={`flex-row items-center py-3 ${
                    index !== results.length - 1 ? "border-b border-gray-100" : ""
                  } ${isSelected ? "rounded-xl bg-gray-100" : ""}`}
                >
                  <View className="w-8 items-center">
                    <MapPin size={17} color={isSelected ? "#000" : "#aaa"} strokeWidth={1.5} />
                  </View>

                  <View className="ml-1 flex-1">
                    <Text className={`text-[9px] ${isSelected ? "font-bold" : "font-semibold"} text-black`}>
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-[7px] text-gray-400">{item.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

          {!isSearching && search.trim().length >= 3 && results.length === 0 && (
            <Text className="mt-5 text-center text-[9px] text-gray-400">Nenhum endereço encontrado.</Text>
          )}

          {error ? <Text className="mt-3 text-[9px] text-red-500">{error}</Text> : null}
        </View>
      </View>

      <View className="px-4 pb-8">
        <TouchableOpacity
          disabled={!selected || isLoading}
          onPress={handleContinue}
          className={`items-center rounded-xl py-3 ${selected ? "bg-black" : "bg-gray-200"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className={`text-[13px] font-semibold ${selected ? "text-white" : "text-gray-400"}`}>
              Continuar
            </Text>
          )}
        </TouchableOpacity>

        {!selected && (
          <Text className="mt-4 text-center text-[7px] text-gray-400">
            Selecione um endereço para continuar.
          </Text>
        )}
      </View>
    </View>
  );
}