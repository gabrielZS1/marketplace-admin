import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Instagram,
  MapPin,
  Save,
  Store,
  X,
} from "lucide-react-native";

import { businessApi } from "../../api/businessApi";

export default function BusinessDetailsScreen({ navigation }) {
  const [businessId, setBusinessId] = useState(null);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Seção que está sendo editada
  const [editingSection, setEditingSection] = useState(null);
  const [editing, setEditing] = useState(false);

  // Seção aberta
  const [openSection, setOpenSection] = useState("company");

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    instagramUrl: "",
    tiktokUrl: "",
    address: "",
    city: "",
    state: "",
    workLocationType: "AT_BUSINESS",
    hasParking: false,
    allowsPets: false,
    hasWifi: false,
  });

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    try {
      setLoading(true);

      // 1. Descobre qual é a empresa do usuário logado
      const myBusiness = await businessApi.getMyStatus();

      if (!myBusiness?.id) {
        throw new Error("Empresa não encontrada");
      }

      // 2. Guarda o ID
      const id = myBusiness.id;

      setBusinessId(id);

      // 3. Busca os detalhes completos da empresa
      const data = await businessApi.getDetails(id);

      setBusiness(data);

      setForm({
        name: data.name || "",
        description: data.description || "",
        phone: data.phone || "",
        instagramUrl: data.instagramUrl || "",
        tiktokUrl: data.tiktokUrl || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        workLocationType: data.workLocationType || "AT_BUSINESS",
        hasParking: data.hasParking ?? false,
        allowsPets: data.allowsPets ?? false,
        hasWifi: data.hasWifi ?? false,
      });
    } catch (error) {
      console.log("Erro ao carregar empresa:", error);

      Alert.alert("Erro", "Não foi possível carregar os dados da empresa.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function toggleSection(section) {
    setOpenSection((current) => (current === section ? null : section));
  }

  function startEditing(section) {
    setEditingSection(section);
    setOpenSection(section);
  }

  function cancelEditing() {
    setEditingSection(null);

    // Recarrega os dados originais para desfazer alterações
    if (business) {
      setForm({
        name: business.name || "",
        description: business.description || "",
        phone: business.phone || "",
        instagramUrl: business.instagramUrl || "",
        tiktokUrl: business.tiktokUrl || "",
        address: business.address || "",
        city: business.city || "",
        state: business.state || "",
        workLocationType: business.workLocationType || "AT_BUSINESS",
        hasParking: business.hasParking ?? false,
        allowsPets: business.allowsPets ?? false,
        hasWifi: business.hasWifi ?? false,
      });
    }
  }

  async function saveSection(section) {
    try {
      setSaving(true);

      const updated = await businessApi.updateDetails(businessId, form);

      setBusiness(updated);
      setEditingSection(null);

      Alert.alert("Tudo certo!", "As informações foram atualizadas.");
    } catch (error) {
      console.log("Erro ao atualizar empresa:", error);

      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (!business) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-[14px] text-gray-500">
          Não foi possível encontrar os dados da empresa.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-5 rounded-xl bg-black px-6 py-3"
        >
          <Text className="text-[13px] font-semibold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>

          <Text className="text-[21px] font-bold text-black">
            Detalhes da empresa
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {/* RESUMO */}
        <View className="mb-7 mt-4 items-center">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {business.logoUrl ? (
              <Image
                source={{
                  uri: business.logoUrl,
                }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Building2 size={36} color="#999" strokeWidth={1.5} />
            )}
          </View>

          <Text className="mt-3 text-[18px] font-bold text-black">
            {business.name || "Sua empresa"}
          </Text>

          <Text className="mt-1 text-[12px] text-gray-400">
            {business.category || "Categoria não definida"}
          </Text>
        </View>

        {/* EMPRESA */}
        <Section
          title="Nome e informações"
          icon={<Building2 size={20} color="#000" />}
          open={openSection === "company"}
          onPress={() => toggleSection("company")}
          editing={editingSection === "company"}
          saving={saving}
          onEdit={() => startEditing("company")}
          onSave={() => saveSection("company")}
          onCancel={cancelEditing}
        >
          <Field
            label="Nome da empresa"
            value={form.name}
            editing={editingSection === "company"}
            onChangeText={(value) => updateField("name", value)}
          />

          <Field
            label="Descrição"
            value={form.description}
            editing={editingSection === "company"}
            multiline
            onChangeText={(value) => updateField("description", value)}
          />

          <Field
            label="Telefone"
            value={form.phone}
            editing={editingSection === "company"}
            keyboardType="phone-pad"
            onChangeText={(value) => updateField("phone", value)}
          />

          <Field
            label="Instagram"
            value={form.instagramUrl}
            editing={editingSection === "company"}
            onChangeText={(value) => updateField("instagramUrl", value)}
          />

          <Field
            label="TikTok"
            value={form.tiktokUrl}
            editing={editingSection === "company"}
            onChangeText={(value) => updateField("tiktokUrl", value)}
          />
        </Section>

        {/* FOTOS */}
        <Section
          title="Fotos e logotipo"
          icon={<Camera size={20} color="#000" />}
          open={openSection === "photos"}
          onPress={() => toggleSection("photos")}
          editing={editingSection === "photos"}
          saving={saving}
          onEdit={() => startEditing("photos")}
          onSave={() => saveSection("photos")}
          onCancel={cancelEditing}
        >
          <Text className="text-[12px] leading-5 text-gray-400">
            Gerencie o logotipo e as fotos utilizadas para apresentar sua
            empresa.
          </Text>

          <View className="mt-4 flex-row flex-wrap">
            {business.photos?.length > 0 ? (
              business.photos.map((photo, index) => (
                <View key={`${photo}-${index}`} className="relative mr-2 mt-2">
                  <Image
                    source={{
                      uri: photo,
                    }}
                    className="h-24 w-24 rounded-xl"
                  />

                  {editingSection === "photos" && (
                    <TouchableOpacity className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/70">
                      <X size={13} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View className="w-full rounded-xl bg-gray-50 p-5">
                <Text className="text-center text-[12px] text-gray-400">
                  Nenhuma foto cadastrada.
                </Text>
              </View>
            )}
          </View>

          {editingSection === "photos" && (
            <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-xl border border-gray-200 py-3">
              <Camera size={17} color="#000" />

              <Text className="ml-2 text-[12px] font-semibold text-black">
                Adicionar foto
              </Text>
            </TouchableOpacity>
          )}
        </Section>

        {/* LOCALIZAÇÃO */}
        <Section
          title="Localização e atendimento"
          icon={<MapPin size={20} color="#000" />}
          open={openSection === "location"}
          onPress={() => toggleSection("location")}
          editing={editingSection === "location"}
          saving={saving}
          onEdit={() => startEditing("location")}
          onSave={() => saveSection("location")}
          onCancel={cancelEditing}
        >
          <Field
            label="Endereço"
            value={form.address}
            editing={editingSection === "location"}
            onChangeText={(value) => updateField("address", value)}
          />

          <View className="flex-row">
            <View className="mr-2 flex-1">
              <Field
                label="Cidade"
                value={form.city}
                editing={editingSection === "location"}
                onChangeText={(value) => updateField("city", value)}
              />
            </View>

            <View className="w-20">
              <Field
                label="Estado"
                value={form.state}
                editing={editingSection === "location"}
                onChangeText={(value) => updateField("state", value)}
              />
            </View>
          </View>

          <Toggle
            label="Atendimento em domicílio"
            value={form.workLocationType === "AT_HOME"}
            editing={editingSection === "location"}
            onValueChange={(value) =>
              updateField("workLocationType", value ? "AT_HOME" : "AT_BUSINESS")
            }
          />

          <Toggle
            label="Estacionamento"
            value={form.hasParking}
            editing={editingSection === "location"}
            onValueChange={(value) => updateField("hasParking", value)}
          />

          <Toggle
            label="Wi-Fi"
            value={form.hasWifi}
            editing={editingSection === "location"}
            onValueChange={(value) => updateField("hasWifi", value)}
          />

          <Toggle
            label="Aceita pets"
            value={form.allowsPets}
            editing={editingSection === "location"}
            onValueChange={(value) => updateField("allowsPets", value)}
          />
        </Section>

        {/* CATEGORIA */}
        <Section
          title="Categoria"
          icon={<Store size={20} color="#000" />}
          open={openSection === "category"}
          onPress={() => toggleSection("category")}
          editing={editingSection === "category"}
          saving={saving}
          onEdit={() => startEditing("category")}
          onSave={() => saveSection("category")}
          onCancel={cancelEditing}
        >
          <Text className="text-[13px] font-semibold text-black">
            {business.category || "Não definida"}
          </Text>

          {editingSection === "category" && (
            <View className="mt-3 rounded-xl bg-gray-50 p-3">
              <Text className="text-[11px] leading-5 text-gray-400">
                A alteração da categoria será adicionada posteriormente.
              </Text>
            </View>
          )}
        </Section>

        {/* TERMOS */}
        <Section
          title="Termos de consentimento"
          icon={<Check size={19} color="#000" />}
          open={openSection === "terms"}
          onPress={() => toggleSection("terms")}
          editing={editingSection === "terms"}
          saving={saving}
          onEdit={() => startEditing("terms")}
          onSave={() => saveSection("terms")}
          onCancel={cancelEditing}
        >
          <Text className="text-[12px] leading-5 text-gray-500">
            Gerencie as informações relacionadas aos termos de consentimento
            utilizados pela empresa.
          </Text>

          {editingSection === "terms" && (
            <View className="mt-4 rounded-xl bg-gray-50 p-4">
              <Text className="text-[11px] leading-5 text-gray-400">
                As opções de termos poderão ser configuradas aqui
                posteriormente.
              </Text>
            </View>
          )}
        </Section>

        {/* POLÍTICAS */}
        <Section
          title="Políticas e segurança"
          icon={<Check size={19} color="#000" />}
          open={openSection === "policies"}
          onPress={() => toggleSection("policies")}
          editing={editingSection === "policies"}
          saving={saving}
          onEdit={() => startEditing("policies")}
          onSave={() => saveSection("policies")}
          onCancel={cancelEditing}
        >
          <Text className="text-[12px] leading-5 text-gray-500">
            Configure informações relacionadas às políticas de atendimento,
            privacidade e segurança.
          </Text>

          {editingSection === "policies" && (
            <View className="mt-4 rounded-xl bg-gray-50 p-4">
              <Text className="text-[11px] leading-5 text-gray-400">
                As configurações de políticas poderão ser adicionadas aqui
                posteriormente.
              </Text>
            </View>
          )}
        </Section>
      </ScrollView>
    </View>
  );
}

/* =====================================================
   SECTION
===================================================== */

function Section({
  title,
  icon,
  open,
  onPress,
  children,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
}) {
  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-gray-200">
      {/* HEADER */}
      <View className="min-h-[64px] flex-row items-center px-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          className="flex-1 flex-row items-center"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            {icon}
          </View>

          <Text className="ml-3 flex-1 text-[13px] font-semibold text-black">
            {title}
          </Text>

          {open ? (
            <ChevronUp size={19} color="#999" />
          ) : (
            <ChevronDown size={19} color="#999" />
          )}
        </TouchableOpacity>

        {/* BOTÕES DA SEÇÃO */}
        {editing ? (
          <View className="ml-3 flex-row items-center">
            <TouchableOpacity
              onPress={onCancel}
              className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={15} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={saving}
              onPress={onSave}
              className="h-8 w-8 items-center justify-center rounded-full bg-black"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Check size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEdit}
            className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Edit3 size={15} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* CONTEÚDO */}
      {open && (
        <View className="border-t border-gray-100 px-4 pb-5 pt-4">
          {children}
        </View>
      )}
    </View>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  value,
  editing,
  onChangeText,
  multiline = false,
  keyboardType = "default",
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-[10px] font-medium uppercase text-gray-400">
        {label}
      </Text>

      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={`Digite ${label.toLowerCase()}`}
          placeholderTextColor="#aaa"
          className={`rounded-xl border border-gray-200 px-3 text-[13px] text-black ${
            multiline ? "min-h-[90px] pt-3" : "h-[46px]"
          }`}
          textAlignVertical={multiline ? "top" : "center"}
        />
      ) : (
        <Text className="text-[13px] text-black">
          {value || "Não informado"}
        </Text>
      )}
    </View>
  );
}

/* =====================================================
   TOGGLE
===================================================== */

function Toggle({
  label,
  value,
  editing = false,
  disabled = false,
  onValueChange,
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[13px] text-black">{label}</Text>

      <TouchableOpacity
        disabled={!editing || disabled}
        onPress={() => onValueChange?.(!value)}
        className={`h-7 w-12 justify-center rounded-full px-1 ${
          value ? "bg-black" : "bg-gray-200"
        }`}
      >
        <View
          className={`h-5 w-5 rounded-full bg-white ${
            value ? "self-end" : "self-start"
          }`}
        />
      </TouchableOpacity>
    </View>
  );
}
