import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Building2, Camera } from "lucide-react-native";

import { useImagePicker } from "../../hooks/useImagePicker";
import { useBusinessStore } from "../../store/businessStore";
import { businessApi } from "../../api/businessApi";
import Screen from "../../components/ui/Screen";
import Field from "../../components/ui/Field";
import Toggle from "../../components/ui/Toggle";
import Button from "../../components/ui/Button";
import PhotoManager from "../../components/business/PhotoManager";
import { mediaUrl } from "../../utils/mediaUrl";
import { BusinessDetailsSkeleton } from "../../components/skeletons";
import { formatPhone, formatHandle } from "../../utils/phone";

const MAX_NAME = 50;
const MAX_DESCRIPTION = 500;
const MAX_HANDLE = 40;

const EMPTY = {
  name: "",
  description: "",
  phone: "",
  instagramUrl: "",
  tiktokUrl: "",
  address: "",
  number: "",
  city: "",
  state: "",
  workLocationType: "AT_BUSINESS",
  hasParking: false,
  allowsPets: false,
  hasWifi: false,
};

function pickForm(b) {
  return {
    name: (b.name || "").slice(0, MAX_NAME),
    description: (b.description || "").slice(0, MAX_DESCRIPTION),
    phone: formatPhone(b.phone || ""),
    instagramUrl: formatHandle(b.instagramUrl || "", MAX_HANDLE),
    tiktokUrl: formatHandle(b.tiktokUrl || "", MAX_HANDLE),
    address: b.address || "",
    number: b.number || "",
    city: b.city || "",
    state: b.state || "",
    workLocationType: b.workLocationType || "AT_BUSINESS",
    hasParking: b.hasParking ?? false,
    allowsPets: b.allowsPets ?? false,
    hasWifi: b.hasWifi ?? false,
  };
}

export default function BusinessDetailsScreen({ navigation }) {
  const businessId = useBusinessStore((s) => s.status?.id);
  const { pickImage } = useImagePicker();

  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await businessApi.getDetails(businessId);
      setBusiness(data);
      setForm(pickForm(data));
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os dados da empresa.");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const dirty =
    business && JSON.stringify(form) !== JSON.stringify(pickForm(business));

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handlePickLogo() {
    const uri = await pickImage();
    if (!uri) return;
    try {
      setUploadingLogo(true);
      await businessApi.uploadLogo(businessId, uri);
      await load();
    } catch (err) {
      Alert.alert("Erro", err.message || "Não foi possível enviar a logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    if (saving || !dirty) return;
    setSaving(true);
    try {
      const updated = await businessApi.updateDetails(businessId, form);
      setBusiness(updated);
      setForm(pickForm(updated));
    } catch (err) {
      Alert.alert("Erro", err.message || "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen navigation={navigation} title="Personalizar empresa">
        <BusinessDetailsSkeleton />
      </Screen>
    );
  }

  return (
    <Screen
      navigation={navigation}
      title="Personalizar empresa"
      footer={
        <Button
          title={dirty ? "Salvar alterações" : "Tudo salvo"}
          onPress={handleSave}
          loading={saving}
          disabled={!dirty}
        />
      }
    >
      {/* LOGO */}
      <View className="items-center pb-2">
        <TouchableOpacity
          onPress={handlePickLogo}
          disabled={uploadingLogo}
          activeOpacity={0.85}
        >
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {uploadingLogo ? (
              <ActivityIndicator color="#111827" />
            ) : business?.logoUrl ? (
              <Image
                source={{ uri: mediaUrl(business.logoUrl) }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Building2 size={34} color="#9CA3AF" strokeWidth={1.5} />
            )}
          </View>
          <View
            style={{ elevation: 2 }}
            className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#111827]"
          >
            <Camera size={14} color="#fff" strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <Text className="mt-3 text-[17px] font-bold text-[#111827]">
          {business?.name || "Sua empresa"}
        </Text>
        {business?.category ? (
          <Text className="mt-0.5 text-[12px] text-gray-400">{business.category}</Text>
        ) : null}
      </View>

      {/* FOTOS */}
      <PhotoManager
        businessId={businessId}
        category="PORTFOLIO"
        title="Portfólio"
        hint="Trabalhos que você já fez"
      />
      <PhotoManager
        businessId={businessId}
        category="WORKSPACE"
        title="Espaço de trabalho"
        hint="Fotos do seu local de atendimento"
      />

      {/* INFORMAÇÕES */}
      <Text className="mb-1 mt-7 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        Informações
      </Text>
      <Field
        label="Nome da empresa"
        value={form.name}
        onChangeText={(v) => set("name", v.slice(0, MAX_NAME))}
        maxLength={MAX_NAME}
      />
      <Field
        label="Descrição"
        value={form.description}
        onChangeText={(v) => set("description", v.slice(0, MAX_DESCRIPTION))}
        placeholder="Conte o que torna seu trabalho especial"
        maxLength={MAX_DESCRIPTION}
        multiline
      />
      <Text className="mt-1 text-right text-[10px] text-gray-400">
        {form.description.length}/{MAX_DESCRIPTION}
      </Text>
      <Field
        label="Telefone"
        value={form.phone}
        onChangeText={(v) => set("phone", formatPhone(v))}
        keyboardType="phone-pad"
        maxLength={16}
      />
      <Field
        label="Instagram"
        value={form.instagramUrl}
        onChangeText={(v) => set("instagramUrl", formatHandle(v, MAX_HANDLE))}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="@seuperfil"
        maxLength={MAX_HANDLE}
      />
      <Field
        label="TikTok"
        value={form.tiktokUrl}
        onChangeText={(v) => set("tiktokUrl", formatHandle(v, MAX_HANDLE))}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="@seuperfil"
        maxLength={MAX_HANDLE}
      />

      {/* LOCALIZAÇÃO */}
      <Text className="mb-1 mt-7 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        Localização
      </Text>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <Field
            label="Endereço"
            value={form.address}
            onChangeText={(v) => set("address", v)}
            placeholder="Rua / avenida"
          />
        </View>
        <View className="w-28">
          <Field
            label="Número"
            value={form.number}
            onChangeText={(v) =>
              set("number", v.replace(/[^\dA-Za-z/ -]/g, "").slice(0, 20))
            }
            placeholder="Nº ou s/n"
          />
        </View>
      </View>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <Field label="Cidade" value={form.city} onChangeText={(v) => set("city", v)} />
        </View>
        <View className="w-24">
          <Field
            label="UF"
            value={form.state}
            onChangeText={(v) => set("state", v)}
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>

      {/* COMODIDADES */}
      <Text className="mb-2 mt-7 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        Atendimento e comodidades
      </Text>
      {[
        {
          label: "Atende na casa do cliente",
          value: form.workLocationType === "AT_CLIENT_HOME",
          set: (v) => set("workLocationType", v ? "AT_CLIENT_HOME" : "AT_BUSINESS"),
        },
        { label: "Estacionamento", value: form.hasParking, set: (v) => set("hasParking", v) },
        { label: "Wi‑Fi", value: form.hasWifi, set: (v) => set("hasWifi", v) },
        { label: "Aceita pets", value: form.allowsPets, set: (v) => set("allowsPets", v) },
      ].map((row) => (
        <View
          key={row.label}
          className="flex-row items-center justify-between border-b border-gray-100 py-3.5"
        >
          <Text className="text-[14px] text-[#111827]">{row.label}</Text>
          <Toggle value={row.value} onValueChange={row.set} />
        </View>
      ))}

      <View className="h-4" />
    </Screen>
  );
}
