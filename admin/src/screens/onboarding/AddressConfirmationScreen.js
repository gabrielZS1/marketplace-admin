import { useState } from "react";
import { Text, View } from "react-native";
import { useOnboardingStore } from "../../store/onboardingStore";
import OnboardingScreen from "../../components/onboarding/OnboardingScreen";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { stepIndex, TOTAL_ONBOARDING_STEPS } from "../../theme";

export default function AddressConfirmationScreen({ navigation, route }) {
  const params = route?.params || {};

  const [street, setStreet] = useState(params.address || "");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState(params.city || "");
  const [state, setState] = useState(params.state || "");
  const [cep, setCep] = useState(params.cep || "");
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    street.trim().length > 0 && city.trim().length > 0 && cep.trim().length > 0;

  async function handleContinue() {
    if (!isValid || isLoading) return;
    try {
      setIsLoading(true);
      navigation.navigate("LocationConfirmation", {
        address: street.trim(),
        complement: complement.trim(),
        city: city.trim(),
        state: state.trim(),
        cep: cep.trim(),
        latitude: params.latitude,
        longitude: params.longitude,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingScreen
      navigation={navigation}
      step={stepIndex("AddressConfirmation")}
      totalSteps={TOTAL_ONBOARDING_STEPS}
      title="Confira o endereço"
      subtitle="Ajuste o que precisar antes de continuar."
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
        label="Rua e número"
        value={street}
        onChangeText={setStreet}
        placeholder="Rua, número"
        clearable
      />
      <Field
        label="Complemento"
        value={complement}
        onChangeText={setComplement}
        placeholder="Sala, andar, referência (opcional)"
      />

      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <Field
            label="Cidade"
            value={city}
            onChangeText={setCity}
            placeholder="Cidade"
          />
        </View>
        <View className="w-24">
          <Field
            label="UF"
            value={state}
            onChangeText={setState}
            placeholder="UF"
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>

      <Field
        label="CEP"
        value={cep}
        onChangeText={setCep}
        placeholder="00000-000"
        keyboardType="numeric"
        maxLength={9}
      />

      {!isValid && (
        <Text className="mt-3 text-[12px] text-gray-400">
          Preencha rua, cidade e CEP para continuar.
        </Text>
      )}
    </OnboardingScreen>
  );
}
