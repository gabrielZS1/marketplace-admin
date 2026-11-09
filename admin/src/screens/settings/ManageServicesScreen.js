import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Plus, Trash2, Clock, Scissors, Pencil } from "lucide-react-native";

import { useBusinessStore } from "../../store/businessStore";
import { serviceApi } from "../../api/serviceApi";
import Screen from "../../components/ui/Screen";
import Button from "../../components/ui/Button";
import { ServiceListSkeleton } from "../../components/skeletons";

const OVERLAY_MAX = 0.5;

function money(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
}

export default function ManageServicesScreen({ navigation }) {
  const businessId = useBusinessStore((s) => s.status?.id);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [modal, setModal] = useState(null); // null | {mode:'create'} | {mode:'edit', service}
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const overlay = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;

  const load = useCallback(() => {
    if (!businessId) return;
    serviceApi
      .list(businessId)
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => setListError("Não foi possível carregar os serviços."))
      .finally(() => setLoading(false));
  }, [businessId]);

  useFocusEffect(load);

  function openModal(next) {
    setFormError(null);
    if (next.mode === "edit") {
      setName(next.service.name || "");
      setDuration(String(next.service.durationMinutes || ""));
      setPrice(
        next.service.price != null
          ? String(next.service.price).replace(".", ",")
          : ""
      );
    } else {
      setName("");
      setDuration("");
      setPrice("");
    }
    setModal(next);
    overlay.setValue(0);
    sheetY.setValue(40);
    Animated.parallel([
      Animated.timing(overlay, { toValue: OVERLAY_MAX, duration: 200, useNativeDriver: true }),
      Animated.spring(sheetY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(overlay, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 40, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => finished && setModal(null));
  }

  async function handleSave() {
    const dur = parseInt(duration, 10);
    const pr = parseFloat(String(price).replace(",", "."));
    if (!name.trim() || !dur || Number.isNaN(pr)) {
      setFormError("Preencha nome, duração (min) e preço.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (modal.mode === "edit") {
        const updated = await serviceApi.update(businessId, modal.service.id, {
          name: name.trim(),
          durationMinutes: dur,
          price: pr,
        });
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await serviceApi.create(businessId, {
          name: name.trim(),
          durationMinutes: dur,
          price: pr,
          locationType: "ON_SITE",
        });
        setServices((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      setFormError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(service) {
    Alert.alert("Remover serviço", `Remover "${service.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await serviceApi.remove(businessId, service.id);
            setServices((prev) => prev.filter((s) => s.id !== service.id));
          } catch (err) {
            Alert.alert("Erro", err.message || "Não foi possível remover.");
          }
        },
      },
    ]);
  }

  return (
    <Screen
      navigation={navigation}
      title="Serviços"
      subtitle="O que aparece pros clientes na hora de agendar."
      footer={<Button title="Adicionar serviço" onPress={() => openModal({ mode: "create" })} />}
    >
      {loading ? (
        <ServiceListSkeleton />
      ) : listError ? (
        <Text className="mt-4 text-[13px] text-red-600">{listError}</Text>
      ) : services.length === 0 ? (
        <View className="mt-10 items-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Scissors size={26} color="#9CA3AF" strokeWidth={1.7} />
          </View>
          <Text className="mt-4 text-center text-[15px] font-semibold text-[#111827]">
            Nenhum serviço ainda
          </Text>
          <Text className="mt-1 text-center text-[13px] leading-5 text-gray-400">
            Adicione seus serviços para os clientes poderem agendar.
          </Text>
        </View>
      ) : (
        services.map((s) => (
          <View
            key={s.id}
            className="mb-3 flex-row items-center rounded-2xl border border-gray-200 px-4 py-3"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Scissors size={16} color="#6B7280" strokeWidth={2} />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openModal({ mode: "edit", service: s })}
              className="ml-3 flex-1"
            >
              <Text className="text-[15px] font-semibold text-[#111827]">{s.name}</Text>
              <View className="mt-0.5 flex-row items-center">
                <Clock size={11} color="#9CA3AF" strokeWidth={2} />
                <Text className="ml-1 text-[12px] text-gray-400">{s.durationMinutes} min</Text>
                <Text className="mx-1.5 text-[12px] text-gray-300">·</Text>
                <Text className="text-[12px] font-medium text-gray-500">{money(s.price)}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openModal({ mode: "edit", service: s })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="mr-3"
            >
              <Pencil size={16} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={16} color="#D1D5DB" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <Modal visible={!!modal} transparent animationType="none" onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay }}
          />
          <Pressable onPress={closeModal} className="absolute inset-0" />
          <Animated.View
            style={{ transform: [{ translateY: sheetY }] }}
            className="w-full max-w-[400px] rounded-3xl bg-white px-6 pb-6 pt-7"
          >
            <Text className="text-lg font-bold text-[#111827]">
              {modal?.mode === "edit" ? "Editar serviço" : "Novo serviço"}
            </Text>

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

            {formError ? (
              <Text className="mt-3 text-[13px] text-red-600">{formError}</Text>
            ) : null}

            <View className="mt-4">
              <Button
                title={modal?.mode === "edit" ? "Salvar" : "Adicionar"}
                onPress={handleSave}
                loading={saving}
              />
            </View>
            <TouchableOpacity onPress={closeModal} className="mt-2 h-11 items-center justify-center">
              <Text className="text-[14px] font-medium text-gray-500">Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}
