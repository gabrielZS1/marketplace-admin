import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronLeft, Gift, X } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";


export default function BasicInfoScreen({ navigation }) {
  const businessId = useOnboardingStore((state) => state.businessId);
  const setPromoCode = useOnboardingStore((state) => state.setPromoCode);

  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(180)).current;

  function openReferralModal() {
    setModalVisible(true);
    overlayOpacity.setValue(0);
    modalTranslateY.setValue(180);

    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
      Animated.spring(modalTranslateY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: false }),
    ]).start();
  }

  function closeReferralModal() {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.timing(modalTranslateY, { toValue: 180, duration: 200, useNativeDriver: false }),
    ]).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  function handlePhoneChange(value) {
    setPhone(formatPhone(value));
  }

  const isValid =
    businessName.trim().length >= 2 &&
    fullName.trim().length >= 3 &&
    phone.replace(/\D/g, "").length >= 10;

  async function handleContinue() {
    if (!isValid || isLoading) return;
    if (!businessId) {
      setError("Sessão de cadastro perdida. Volte e selecione a categoria novamente.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onboardingApi.basicInfo(businessId, {
        name: businessName.trim(),
      });
      navigation.navigate("WorkLocation");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-7">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <View className="h-full rounded-full bg-green-500" style={{ width: "33%" }} />
        </View>

        <View className="mt-7">
          <Text className="text-[16px] font-semibold text-black">Sobre você</Text>
          <Text className="mt-1 text-[7px] text-gray-400">
            Conte-nos mais sobre você e sua empresa.
          </Text>
        </View>

        <View className="relative mt-6">
          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] text-black">Nome comercial</Text>
          </View>

          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            className="h-11 rounded-xl border-2 border-black px-3 pr-10 text-[12px] text-black"
            placeholder="Nome comercial"
            placeholderTextColor="#999"
          />

          {businessName.length > 0 && (
            <TouchableOpacity onPress={() => setBusinessName("")} className="absolute right-3 top-3">
              <X size={15} color="#000" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        <View className="relative mt-3">
          <View className="absolute left-4 top-[-5px] z-10 bg-white px-1">
            <Text className="text-[7px] text-gray-400">Nome e Sobrenome</Text>
          </View>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            className="h-11 rounded-xl border border-gray-200 px-3 text-[12px] text-gray-500"
            placeholder="Nome e Sobrenome"
            placeholderTextColor="#999"
          />
        </View>

        <View className="mt-3 flex-row overflow-hidden rounded-xl border border-gray-200">
          <View className="h-11 w-12 items-center justify-center border-r border-gray-200">
            <Text className="text-[11px] font-semibold text-black">+55</Text>
          </View>

          <TextInput
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            className="h-11 flex-1 px-3 text-[11px] text-black"
            placeholder="Seu número de telefone"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openReferralModal}
          className="mt-5 flex-row items-center border-b border-gray-100 pb-3"
        >
          <Gift size={21} color="#000" strokeWidth={2} />
          <Text className="ml-3 text-[9px] font-medium text-black">
            Possui um código de indicação?
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text className="mt-3 text-[9px] text-red-500">{error}</Text>
        ) : null}
      </View>

      <View className="border-t border-gray-100 px-4 pb-8 pt-4">
        <TouchableOpacity
          disabled={!isValid || isLoading}
          onPress={handleContinue}
          className={`items-center rounded-xl py-3 ${isValid ? "bg-black" : "bg-gray-100"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className={`text-[13px] font-semibold ${isValid ? "text-white" : "text-gray-300"}`}>
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeReferralModal}>
        <View className="flex-1 justify-end">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
          <Pressable onPress={closeReferralModal} className="absolute inset-0" />

          <View className="items-center pb-3">
            <Animated.View
              className="w-[76%] max-w-[280px] rounded-2xl bg-white px-4 pb-3 pt-5"
              style={{ transform: [{ translateY: modalTranslateY }] }}
            >
              <Text className="text-center text-[13px] font-bold text-black">
                Possui um código de indicação?
              </Text>
              <Text className="mt-3 px-5 text-center text-[7px] leading-[10px] text-gray-400">
                Você possui um código de indicação de outro usuário da Glowly?
                Se sim, insira aqui.
              </Text>

              <TextInput
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder="Código de indicação"
                placeholderTextColor="#999"
                className="mt-4 h-9 rounded-xl border border-gray-300 px-3 text-[9px] text-black"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (referralCode.trim()) {
                    setPromoCode(referralCode.trim().toUpperCase());
                    closeReferralModal();
                  }
                }}
                className="mt-3 h-9 items-center justify-center rounded-xl bg-black"
              >
                <Text className="text-[8px] font-semibold text-white">ADICIONAR CÓDIGO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeReferralModal}
                className="mt-1.5 h-7 items-center justify-center rounded-xl border border-gray-400"
              >
                <Text className="text-[7px] font-medium text-black">CANCELAR</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
}