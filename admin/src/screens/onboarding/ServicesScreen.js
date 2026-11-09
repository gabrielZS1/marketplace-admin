import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Plus, Trash2, Clock, Scissors } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { serviceApi } from "../../api/serviceApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";
import { ServiceListSkeleton } from "../../components/skeletons";

const OVERLAY_MAX = 0.5;

export default function ServicesScreen({ navigation }) {
  const businessId = useOnboardingStore((state) => state.businessId);

  const [services, setServices] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(40)).current;

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

  function openModal() {
    setName("");
    setDuration("");
    setPrice("");
    setError(null);
    setModalVisible(true);
    overlayOpacity.setValue(0);
    modalTranslateY.setValue(40);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: OVERLAY_MAX, duration: 200, useNativeDriver: true }),
      Animated.spring(modalTranslateY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(modalTranslateY, { toValue: 40, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  }

  async function handleSaveService() {
    const durationNumber = parseInt(duration, 10);
    const priceNumber = parseFloat(price.replace(",", "."));

    if (!name.trim() || !durationNumber || !priceNumber) {
      setError("Preencha nome, duração (em minutos) e preço.");
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
      closeModal();
    } catch (err) {
      setError(err.message || "Não foi possível salvar o serviço.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await serviceApi.remove(businessId, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message || "Não foi possível remover o serviço.");
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("Services")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Adicione seus serviços"
      subtitle="Cadastre pelo menos um. Você pode ajustar tudo depois."
      scroll
      footer={
        <Button
          title="Continuar"
          onPress={() => navigation.navigate("Complete")}
          disabled={services.length < 1}
        />
      }
    >
      {isFetching ? <ServiceListSkeleton count={2} /> : null}

      {services.map((service) => (
        <View
          key={service.id}
          className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Scissors size={16} color="#6B7280" strokeWidth={2} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-semibold text-[#111827]">
              {service.name}
            </Text>
            <View className="mt-0.5 flex-row items-center">
              <Clock size={11} color="#9CA3AF" strokeWidth={2} />
              <Text className="ml-1 text-[12px] text-gray-400">
                {service.durationMinutes} min
              </Text>
              <Text className="mx-1.5 text-[12px] text-gray-300">·</Text>
              <Text className="text-[12px] font-medium text-gray-500">
                R$ {service.price?.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(service.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color="#D1D5DB" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openModal}
        className="flex-row items-center justify-center rounded-2xl border border-dashed border-gray-300 py-4"
      >
        <Plus size={18} color="#111827" strokeWidth={2.2} />
        <Text className="ml-2 text-[14px] font-semibold text-[#111827]">
          Adicionar serviço
        </Text>
      </TouchableOpacity>

      {error && !modalVisible ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
          <Pressable onPress={closeModal} className="absolute inset-0" />

          <Animated.View
            style={{ transform: [{ translateY: modalTranslateY }] }}
            className="w-full max-w-[400px] rounded-3xl bg-white px-6 pb-6 pt-7"
          >
            <Text className="text-lg font-bold text-[#111827]">Novo serviço</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do serviço"
              placeholderTextColor="#9CA3AF"
              className="mt-5 h-14 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
            />
            <View className="mt-3 flex-row" style={{ gap: 12 }}>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="Duração (min)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="h-14 flex-1 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
              />
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Preço (R$)"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="h-14 flex-1 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
              />
            </View>

            {error && modalVisible ? (
              <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
            ) : null}

            <View className="mt-4">
              <Button title="Salvar serviço" onPress={handleSaveService} loading={isSaving} />
            </View>
            <TouchableOpacity onPress={closeModal} className="mt-2 h-11 items-center justify-center">
              <Text className="text-[14px] font-medium text-gray-500">Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </OnboardingScreen>
  );
}
