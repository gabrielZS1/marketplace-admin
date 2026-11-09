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
import { Gift, Trash2, Check } from "lucide-react-native";

import { useBusinessStore } from "../../store/businessStore";
import { giftCardApi } from "../../api/giftCardApi";
import Screen from "../../components/ui/Screen";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import { GiftCardListSkeleton } from "../../components/skeletons";

const OVERLAY_MAX = 0.5;

const TIERS = [
  { value: "SILVER", label: "Prata", chipBg: "#F3F4F6", chipText: "#4B5563", dot: "#9CA3AF" },
  { value: "GOLD", label: "Ouro", chipBg: "#FEF3C7", chipText: "#B45309", dot: "#B45309" },
  { value: "DIAMOND", label: "Diamante", chipBg: "#E0E7FF", chipText: "#4338CA", dot: "#4F46E5" },
];
const tierOf = (v) => TIERS.find((t) => t.value === v) || TIERS[0];

function money(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
}

export default function GiftCardsScreen({ navigation }) {
  const businessId = useBusinessStore((s) => s.status?.id);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [tier, setTier] = useState("SILVER");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [validity, setValidity] = useState("");
  const [description, setDescription] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const overlay = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(40)).current;

  const load = useCallback(() => {
    if (!businessId) return;
    giftCardApi
      .list(businessId)
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId]);

  useFocusEffect(load);

  function openModal() {
    setTier("SILVER");
    setTitle("");
    setPrice("");
    setValidity("");
    setDescription("");
    setBenefitsText("");
    setFormError(null);
    setModal(true);
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
    ]).start(({ finished }) => finished && setModal(false));
  }

  async function handleCreate() {
    const pr = parseFloat(String(price).replace(",", "."));
    if (!title.trim() || Number.isNaN(pr) || pr <= 0) {
      setFormError("Preencha o título e um preço válido.");
      return;
    }
    const benefits = benefitsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    setFormError(null);
    try {
      const created = await giftCardApi.create(businessId, {
        category: tier,
        title: title.trim(),
        price: pr,
        description: description.trim() || null,
        validityLabel: validity.trim() || null,
        benefits,
      });
      setCards((prev) => [...prev, created]);
      closeModal();
    } catch (err) {
      setFormError(err.message || "Não foi possível criar o cartão.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(card) {
    Alert.alert("Remover cartão-presente", `Remover "${card.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await giftCardApi.remove(businessId, card.id);
            setCards((prev) => prev.filter((c) => c.id !== card.id));
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
      title="Cartões-presente"
      subtitle="Pacotes que os clientes compram para presentear alguém."
      footer={<Button title="Criar cartão-presente" onPress={openModal} />}
    >
      {loading ? (
        <GiftCardListSkeleton />
      ) : cards.length === 0 ? (
        <View className="mt-10 items-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Gift size={26} color="#9CA3AF" strokeWidth={1.7} />
          </View>
          <Text className="mt-4 text-center text-[15px] font-semibold text-[#111827]">
            Nenhum cartão-presente
          </Text>
          <Text className="mt-1 text-center text-[13px] leading-5 text-gray-400">
            Crie pacotes que aparecem pros clientes comprarem de presente.
          </Text>
        </View>
      ) : (
        cards.map((card) => {
          const t = tierOf(card.category);
          return (
            <View
              key={card.id}
              className="mb-3 rounded-2xl border border-gray-200 p-4"
            >
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View
                    className="self-start rounded-full px-2 py-0.5"
                    style={{ backgroundColor: t.chipBg }}
                  >
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: t.chipText }}
                    >
                      {t.label.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-[15px] font-semibold text-[#111827]">
                    {card.title}
                  </Text>
                  <Text className="mt-0.5 text-[13px] font-medium text-gray-500">
                    {money(card.price)}
                    {card.validityLabel ? ` · válido por ${card.validityLabel}` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(card)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={16} color="#D1D5DB" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {card.description ? (
                <Text className="mt-2 text-[12px] leading-4 text-gray-400">
                  {card.description}
                </Text>
              ) : null}

              {card.benefits?.length > 0 ? (
                <View className="mt-2">
                  {card.benefits.map((b, i) => (
                    <View key={i} className="mt-1 flex-row items-start">
                      <Check size={12} color={t.dot} strokeWidth={3} style={{ marginTop: 2 }} />
                      <Text className="ml-1.5 flex-1 text-[12px] text-gray-500">{b}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })
      )}

      <Text className="mt-2 text-[12px] text-gray-400">
        Para alterar um cartão, remova e crie de novo.
      </Text>

      <Modal visible={modal} transparent animationType="none" onRequestClose={closeModal}>
        <View className="flex-1 justify-end">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay }}
          />
          <Pressable onPress={closeModal} className="absolute inset-0" />
          <Animated.View
            style={{ transform: [{ translateY: sheetY }] }}
            className="max-h-[88%] rounded-t-3xl bg-white px-5 pb-8 pt-5"
          >
            <Text className="text-lg font-bold text-[#111827]">Novo cartão-presente</Text>

            {/* TIER */}
            <View className="mt-4 flex-row rounded-2xl bg-gray-100 p-1">
              {TIERS.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setTier(t.value)}
                  className={`flex-1 items-center rounded-xl py-2 ${
                    tier === t.value ? "bg-white" : ""
                  }`}
                  style={
                    tier === t.value
                      ? { elevation: 1, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4 }
                      : null
                  }
                >
                  <Text
                    className={`text-[13px] font-semibold ${
                      tier === t.value ? "text-[#111827]" : "text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label="Título"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Dia de cuidados"
            />
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <Field
                  label="Preço (R$)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="150,00"
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Validade"
                  value={validity}
                  onChangeText={setValidity}
                  placeholder="Ex.: 6 meses"
                />
              </View>
            </View>
            <Field
              label="Descrição (opcional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Uma frase sobre o pacote"
            />
            <Field
              label="Benefícios — um por linha"
              value={benefitsText}
              onChangeText={setBenefitsText}
              placeholder={"Corte + escova\nHidratação\nCafé da casa"}
              multiline
            />

            {formError ? (
              <Text className="mt-3 text-[13px] text-red-600">{formError}</Text>
            ) : null}

            <View className="mt-4">
              <Button title="Criar" onPress={handleCreate} loading={saving} />
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
