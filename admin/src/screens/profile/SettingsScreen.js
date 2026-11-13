import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  UserRound,
  Building2,
  Scissors,
  Clock,
  Coffee,
  Users,
  CreditCard,
  Bell,
  KeyRound,
  LogOut,
  ChevronRight,
  Gift,
  FileText,
  ShieldCheck,
  Trash2,
} from "lucide-react-native";

import { useAuthStore } from "../../store/authStore";
import { useBusinessStore } from "../../store/businessStore";
import { useIsOwner, useMyEmployeeId } from "../../hooks/useRole";
import { useImagePicker } from "../../hooks/useImagePicker";
import { authApi } from "../../api/authApi";
import { uploadEmployeePhoto } from "../../api/employeeApi";
import { mediaUrl } from "../../utils/mediaUrl";
import { openLegal } from "../../constants/legal";
import Screen from "../../components/ui/Screen";

const OWNER_SECTIONS = [
  {
    title: "Negócio",
    items: [
      { label: "Personalizar empresa", hint: "Nome, logo, fotos, endereço e contato", icon: Building2, target: "BusinessDetails" },
      { label: "Serviços", hint: "O que você oferece, preços e duração", icon: Scissors, target: "ManageServices" },
      { label: "Cartões-presente", hint: "Pacotes que os clientes podem comprar de presente", icon: Gift, target: "GiftCards" },
      { label: "Horário de funcionamento", hint: "Dias e horários que você atende", icon: Clock, target: "ManageHours" },
      { label: "Intervalo", hint: "Pausas que se repetem todo dia, como o almoço", icon: Coffee, target: "Interval" },
      { label: "Equipe", hint: "Profissionais do estabelecimento", icon: Users, target: "Funcionarios" },
    ],
  },
  {
    title: "Assinatura",
    items: [
      { label: "Plano e cobrança", hint: "Seu plano, período de teste e pagamento", icon: CreditCard, target: "Billing" },
    ],
  },
];

const COMMON_SECTION = {
  title: "Conta",
  items: [
    { label: "Notificações", hint: "Avisos de novos agendamentos neste aparelho", icon: Bell, target: "NotificationSettings" },
    { label: "Trocar senha", hint: "Alterar a senha de acesso", icon: KeyRound, target: "ChangePassword" },
    { label: "Excluir conta", hint: "Remove seus dados e encerra o acesso", icon: Trash2, target: "DeleteAccount", danger: true },
  ],
};

const LEGAL_SECTION = {
  title: "Legal",
  items: [
    { label: "Termos de uso", hint: "Regras de uso da plataforma", icon: FileText, onPress: () => openLegal("terms") },
    { label: "Política de privacidade", hint: "Como tratamos seus dados", icon: ShieldCheck, onPress: () => openLegal("privacy") },
  ],
};

function Row({ item, onPress, last }) {
  const Icon = item.icon;
  const danger = item.danger;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center py-4 ${last ? "" : "border-b border-gray-100"}`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${
          danger ? "bg-red-50" : "bg-gray-100"
        }`}
      >
        <Icon size={18} color={danger ? "#DC2626" : "#374151"} strokeWidth={2} />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className={`text-[15px] font-semibold ${
            danger ? "text-[#DC2626]" : "text-[#111827]"
          }`}
        >
          {item.label}
        </Text>
        <Text className="mt-0.5 text-[12px] text-gray-400">{item.hint}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
    </TouchableOpacity>
  );
}

// Foto do próprio funcionário (aparece pros clientes na equipe do estabelecimento).
function MyPhoto() {
  const name = useAuthStore((state) => state.user?.name);
  const businessId = useBusinessStore((state) => state.status?.id);
  const employeeId = useMyEmployeeId();
  const { pickImage } = useImagePicker();

  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let alive = true;
    authApi
      .getMe()
      .then((me) => alive && setPhotoUrl(me?.photoUrl || null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function handlePick() {
    if (uploading || !businessId || !employeeId) return;
    const uri = await pickImage();
    if (!uri) return;
    try {
      setUploading(true);
      const res = await uploadEmployeePhoto(businessId, employeeId, uri);
      setPhotoUrl(res?.photoUrl || null);
    } catch (err) {
      Alert.alert("Erro", err?.message || "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="mb-6 flex-row items-center rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <TouchableOpacity activeOpacity={0.85} onPress={handlePick} disabled={uploading}>
        <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {uploading ? (
            <ActivityIndicator color="#111827" />
          ) : photoUrl ? (
            <Image
              source={{ uri: mediaUrl(photoUrl) }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <UserRound size={30} color="#9CA3AF" strokeWidth={1.6} />
          )}
        </View>
        <View
          style={{ elevation: 2 }}
          className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#111827]"
        >
          <Camera size={12} color="#fff" strokeWidth={2} />
        </View>
      </TouchableOpacity>

      <View className="ml-4 flex-1">
        <Text className="text-[15px] font-semibold text-[#111827]" numberOfLines={1}>
          {name || "Minha foto"}
        </Text>
        <Text className="mt-1 text-[12px] leading-4 text-gray-500">
          {photoUrl
            ? "Toque na foto para trocar. Ela aparece para os clientes na equipe."
            : "Toque no círculo para colocar sua foto. Ela aparece para os clientes na equipe."}
        </Text>
      </View>
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const logout = useAuthStore((state) => state.logout);
  const email = useAuthStore((state) => state.user?.email);
  const isOwner = useIsOwner();

  const sections = isOwner
    ? [...OWNER_SECTIONS, COMMON_SECTION, LEGAL_SECTION]
    : [COMMON_SECTION, LEGAL_SECTION];

  function confirmLogout() {
    Alert.alert("Sair da conta", "Você vai precisar entrar de novo neste aparelho.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout() },
    ]);
  }

  return (
    <Screen navigation={navigation} title="Configurações">
      {!isOwner ? <MyPhoto /> : null}

      {sections.map((section) => (
        <View key={section.title} className="mb-6">
          <Text className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {section.title}
          </Text>
          {section.items.map((item, i) => (
            <Row
              key={item.label}
              item={item}
              last={i === section.items.length - 1}
              onPress={item.onPress || (() => navigation.navigate(item.target))}
            />
          ))}
        </View>
      ))}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={confirmLogout}
        className="mt-2 flex-row items-center py-4"
      >
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <LogOut size={18} color="#DC2626" strokeWidth={2} />
        </View>
        <Text className="ml-3 text-[15px] font-semibold text-[#DC2626]">Sair da conta</Text>
      </TouchableOpacity>

      {email ? (
        <Text className="mt-4 text-center text-[12px] text-gray-400">
          Conectado como {email}
        </Text>
      ) : null}
    </Screen>
  );
}
