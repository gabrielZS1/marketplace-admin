import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gift, Check } from "lucide-react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import { onboardingApi } from "../../api/onboardingApi";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

const OVERLAY_MAX = 0.5;

export default function BasicInfoScreen({ navigation }) {
  const businessId = useOnboardingStore((state) => state.businessId);
  const setPromoCode = useOnboardingStore((state) => state.setPromoCode);
  const promoCode = useOnboardingStore((state) => state.promoCode);

  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(40)).current;

  function openReferralModal() {
    setModalVisible(true);
    overlayOpacity.setValue(0);
    modalTranslateY.setValue(40);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: OVERLAY_MAX, duration: 200, useNativeDriver: true }),
      Animated.spring(modalTranslateY, { toValue: 0, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true }),
    ]).start();
  }

  function closeReferralModal() {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(modalTranslateY, { toValue: 40, duration: 180, useNativeDriver: true }),
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
      await onboardingApi.basicInfo(businessId, { name: businessName.trim() });
      navigation.navigate("WorkLocation");
    } catch (err) {
      setError(err.message || "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("BasicInfo")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Sobre você e a empresa"
      subtitle="Esses dados aparecem pros clientes no marketplace."
      scroll
      footer={
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!isValid}
        />
      }
    >
      <Field
        label="Nome comercial"
        value={businessName}
        onChangeText={setBusinessName}
        placeholder="Ex.: Studio Marina"
        clearable
      />

      <Field
        label="Seu nome completo"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nome e sobrenome"
      />

      <View className="mt-4">
        <View className="absolute left-3 top-[-8px] z-10 bg-white px-1.5">
          <Text className="text-[11px] font-medium text-gray-400">Telefone</Text>
        </View>
        <View className="h-14 flex-row items-center overflow-hidden rounded-2xl border border-gray-200">
          <View className="h-full w-14 items-center justify-center border-r border-gray-200 bg-gray-50">
            <Text className="text-[15px] font-semibold text-[#111827]">+55</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(v) => setPhone(formatPhone(v))}
            keyboardType="phone-pad"
            placeholder="(00) 00000-0000"
            placeholderTextColor="#9CA3AF"
            className="h-full flex-1 px-4 text-[15px] text-[#111827]"
          />
        </View>
      </View>

      {promoCode ? (
        <View className="mt-5 flex-row items-center rounded-2xl border border-[#111827] bg-[#F5F6F8] px-4 py-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-[#111827]">
            <Check size={16} color="#fff" strokeWidth={3} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-[#111827]">
              Código {promoCode} aplicado
            </Text>
            <Text className="text-[11px] text-gray-500">
              O benefício entra ao finalizar o cadastro.
            </Text>
          </View>
          <TouchableOpacity onPress={() => setPromoCode(null)}>
            <Text className="text-[12px] font-medium text-gray-500">Remover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openReferralModal}
          className="mt-5 flex-row items-center rounded-2xl border border-dashed border-gray-300 px-4 py-4"
        >
          <Gift size={18} color="#111827" strokeWidth={2} />
          <Text className="ml-3 flex-1 text-[14px] font-medium text-[#111827]">
            Tenho um código promocional
          </Text>
          <Text className="text-[12px] text-gray-400">Opcional</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <Text className="mt-3 text-[13px] text-red-600">{error}</Text>
      ) : null}

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeReferralModal}>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            pointerEvents="none"
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
          <Pressable onPress={closeReferralModal} className="absolute inset-0" />

          <Animated.View
            style={{ transform: [{ translateY: modalTranslateY }] }}
            className="w-full max-w-[400px] rounded-3xl bg-white px-6 pb-6 pt-7"
          >
            <View className="mb-4 h-12 w-12 items-center justify-center self-center rounded-2xl bg-[#F5F6F8]">
              <Gift size={22} color="#111827" strokeWidth={2} />
            </View>

            <Text className="text-center text-lg font-bold text-[#111827]">
              Código promocional
            </Text>
            <Text className="mt-2 text-center text-[13px] leading-5 text-gray-500">
              Recebeu um código no e-mail? Digite abaixo para ativar seu benefício.
            </Text>

            <TextInput
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              autoFocus
              placeholder="Ex.: TESTE15A"
              placeholderTextColor="#9CA3AF"
              className="mt-5 h-14 rounded-2xl border border-gray-300 px-4 text-center text-[16px] font-semibold tracking-[2px] text-[#111827]"
            />

            <View className="mt-4">
              <Button
                title="Aplicar código"
                onPress={() => {
                  if (referralCode.trim()) {
                    setPromoCode(referralCode.trim().toUpperCase());
                    closeReferralModal();
                  }
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={closeReferralModal}
              className="mt-2 h-11 items-center justify-center"
            >
              <Text className="text-[14px] font-medium text-gray-500">Agora não</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </OnboardingScreen>
  );
}
