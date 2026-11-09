import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Search, MapPin, Check } from "lucide-react-native";
import { geocodingApi } from "../../api/geocodingApi";
import { useOnboardingStore } from "../../store/onboardingStore";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Button from "../../components/ui/Button";
import { AddressResultsSkeleton } from "../../components/skeletons";

export default function AddressSearchScreen({ navigation }) {
  const setSelectedAddress = useOnboardingStore((state) => state.setSelectedAddress);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
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
    }, 600);
    return () => clearTimeout(timeout);
  }, [search]);

  function handleContinue() {
    if (!selected) return;
    setSelectedAddress(selected);
    navigation.goBack();
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      title="Buscar endereço"
      subtitle="Digite a rua e o número do seu atendimento."
      scroll
      footer={
        <Button title="Usar este endereço" onPress={handleContinue} disabled={!selected} />
      }
    >
      <View className="h-14 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
        <Search size={18} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          autoFocus
          placeholder="Ex.: Av. Paulista, 1000"
          placeholderTextColor="#9CA3AF"
          className="ml-3 flex-1 text-[15px] text-[#111827]"
        />
      </View>

      <View className="mt-3">
        {isSearching ? (
          <AddressResultsSkeleton />
        ) : null}

        {!isSearching &&
          results.map((item) => {
            const isSelected = selected?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelected(item)}
                className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
                  isSelected ? "border-[#111827] bg-[#F5F6F8]" : "border-gray-200 bg-white"
                }`}
              >
                <MapPin
                  size={18}
                  color={isSelected ? "#111827" : "#9CA3AF"}
                  strokeWidth={2}
                />
                <View className="ml-3 flex-1">
                  <Text
                    numberOfLines={1}
                    className={`text-[14px] ${
                      isSelected ? "font-semibold text-[#111827]" : "font-medium text-gray-800"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} className="mt-0.5 text-[12px] text-gray-400">
                    {item.subtitle}
                  </Text>
                </View>
                {isSelected ? (
                  <Check size={18} color="#111827" strokeWidth={2.5} />
                ) : null}
              </TouchableOpacity>
            );
          })}

        {!isSearching && search.trim().length >= 3 && results.length === 0 && (
          <Text className="mt-6 text-center text-[13px] text-gray-400">
            Nenhum endereço encontrado.
          </Text>
        )}

        {error ? (
          <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
        ) : null}
      </View>
    </OnboardingScreen>
  );
}
