import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  X,
} from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { serviceApi } from "../../api/serviceApi";

export default function ServicesScreen({ navigation }) {
  const businessId = useOnboardingStore((state) => state.businessId);

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    if (!businessId) {
      setIsFetching(false);
      return;
    }
    try {
      const data = await serviceApi.list(businessId);
      setServices(data);
    } catch (err) {
      setError(err.message || "Não foi possível carregar os serviços.");
    } finally {
      setIsFetching(false);
    }
  }

  function openAddModal() {
    setName("");
    setDuration("");
    setPrice("");
    setModalVisible(true);
  }

  async function handleSaveService() {
    const durationNumber = parseInt(duration, 10);
    const priceNumber = parseFloat(price.replace(",", "."));

    if (!name.trim() || !durationNumber || !priceNumber) {
      setError("Preencha nome, duração (em minutos) e preço corretamente.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const created = await serviceApi.create(businessId, {
        name: name.trim(),
        durationMinutes: durationNumber,
        price: priceNumber,
        locationType: "ON_SITE",
      });
      setServices((prev) => [...prev, created]);
      setModalVisible(false);
    } catch (err) {
      setError(err.message || "Não foi possível salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await serviceApi.remove(businessId, id);
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (err) {
      setError(err.message || "Não foi possível remover o serviço.");
    }
  }

  function handleServicePress(service) {
    console.log("Serviço selecionado:", service);
  }

  async function handleContinue() {
    if (services.length < 1 || isLoading) return;
    navigation.navigate("Complete")
  }

  return (
    <View className="flex-1 bg-white">
      {/* CONTEÚDO */}
      <View className="flex-1 px-4 pt-14">
        {/* VOLTAR */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-7">
          <ChevronLeft size={24} color="#000" strokeWidth={2} />
        </TouchableOpacity>

        {/* PROGRESSO */}
        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View
            className="h-full rounded-full bg-green-500"
            style={{ width: "77%" }}
          />
        </View>

        {/* TÍTULO */}
        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">
            Adicione seus serviços
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openAddModal}
            className="mt-3 flex-row items-center self-start rounded-lg border border-gray-300 px-3 py-2"
          >
            <Plus size={16} color="#000" strokeWidth={2} />
            <Text className="ml-1.5 text-[9px] font-medium text-black">
              Adicionar serviço
            </Text>
          </TouchableOpacity>

          <Text className="mt-1 pr-2 text-[7px] leading-[10px] text-gray-400">
            Adicione pelo menos 3 serviços agora. Mais tarde, você pode
            adicionar mais, editar detalhes e agrupar serviços em categorias.
          </Text>
        </View>

        {/* SERVIÇOS */}
        <View className="mt-5">
          {isFetching ? (
            <ActivityIndicator className="mt-6" color="#000" />
          ) : null}

          {error ? (
            <Text className="mt-3 text-[9px] text-red-500">{error}</Text>
          ) : null}

          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.7}
              onPress={() => handleServicePress(service)}
              className="flex-row items-center border-b border-gray-100 py-2.5"
            >
              {/* LIXEIRA */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDelete(service.id)}
                className="mr-2 w-6 items-center"
              >
                <Trash2 size={17} color="#cfcfcf" strokeWidth={1.8} />
              </TouchableOpacity>

              {/* INFORMAÇÕES */}
              <View className="flex-1">
                <Text className="text-[10px] font-medium text-black">
                  {service.name}
                </Text>

                <Text className="mt-0.5 text-[6px] text-gray-400">
                  {service.durationMinutes} min
                </Text>
              </View>

              {/* PREÇO */}
              <Text className="mr-2 text-[10px] font-medium text-black">
                R$ {service.price?.toFixed(2).replace(".", ",")}
              </Text>

              {/* SETA */}
              <ChevronRight size={17} color="#000" strokeWidth={1.8} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* RODAPÉ */}
      <View className="px-4 pb-8">
        <TouchableOpacity
          disabled={services.length < 1 || isLoading}
          onPress={handleContinue}
          className="items-center rounded-xl bg-black py-3"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[13px] font-semibold text-white">
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] font-bold text-black">
                Novo serviço
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do serviço"
              placeholderTextColor="#999"
              className="mt-4 h-11 rounded-xl border border-gray-200 px-3 text-[11px] text-black"
            />

            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="Duração (minutos)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              className="mt-3 h-11 rounded-xl border border-gray-200 px-3 text-[11px] text-black"
            />

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Preço (ex: 40,00)"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              className="mt-3 h-11 rounded-xl border border-gray-200 px-3 text-[11px] text-black"
            />

            <TouchableOpacity
              disabled={isSaving}
              onPress={handleSaveService}
              className="mt-4 items-center rounded-xl bg-black py-3"
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[12px] font-semibold text-white">
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
