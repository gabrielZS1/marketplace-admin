import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowLeft,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react-native";

import { updateEmployee } from "../../api/employeeApi";
import { getEmployeeWorkingHours } from "../../api/workingHourApi";

export default function EditEmployeeScreen({ navigation, route }) {
  const businessId = route?.params?.businessId;
  const employee = route?.params?.employee;

  const [name, setName] = useState(employee?.name || "");
  const [phone, setPhone] = useState(employee?.phone || "");
  const [specialty, setSpecialty] = useState(
    employee?.specialty || ""
  );
  const [bio, setBio] = useState(employee?.bio || "");

  const [workingHours, setWorkingHours] = useState([]);
  const [loadingHours, setLoadingHours] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    name.trim().length >= 3 &&
    specialty.trim().length > 0;

  // =========================================================
  // CARREGAR HORÁRIOS
  // =========================================================

  useEffect(() => {
    async function loadWorkingHours() {
      if (!employee?.id) {
        setLoadingHours(false);
        return;
      }

      try {
        setLoadingHours(true);

        const hours = await getEmployeeWorkingHours(
          employee.id
        );

        console.log(
          "🕐 Horários do funcionário:",
          hours
        );

        setWorkingHours(hours || []);
      } catch (error) {
        console.log(
          "❌ Erro ao carregar horários:",
          error
        );

        Alert.alert(
          "Erro",
          "Não foi possível carregar os horários do funcionário."
        );
      } finally {
        setLoadingHours(false);
      }
    }

    loadWorkingHours();
  }, [employee?.id]);

  // =========================================================
  // TELEFONE
  // =========================================================

  function formatPhone(value) {
    const numbers = value
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      7
    )}-${numbers.slice(7)}`;
  }

  // =========================================================
  // ATUALIZAR FUNCIONÁRIO
  // =========================================================

  async function handleUpdate() {
    if (!businessId || !employee?.id) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o funcionário."
      );
      return;
    }

    if (!canSubmit) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha o nome e a especialidade."
      );
      return;
    }

    try {
      setIsLoading(true);

      await updateEmployee(
        businessId,
        employee.id,
        {
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          specialty: specialty.trim(),
          bio: bio.trim() || null,
        }
      );

      Alert.alert(
        "Alterações salvas",
        "Os dados do funcionário foram atualizados.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "❌ Erro ao atualizar funcionário:",
        error
      );

      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Não foi possível atualizar o funcionário.";

      Alert.alert("Erro", message);
    } finally {
      setIsLoading(false);
    }
  }

  // =========================================================
  // DIAS DA SEMANA
  // =========================================================

  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 55,
          paddingBottom: 40,
        }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="mr-4 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft
              size={19}
              color="#000"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View>
            <Text className="text-[21px] font-bold text-black">
              Editar funcionário
            </Text>

            <Text className="mt-0.5 text-[10px] text-gray-400">
              Atualize os dados do profissional
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* ÍCONE */}
        {/* ================================================= */}

        <View className="mt-8 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <UserRound
              size={34}
              color="#777"
              strokeWidth={1.5}
            />
          </View>

          <Text className="mt-3 text-[11px] text-gray-400">
            Dados do profissional
          </Text>
        </View>

        {/* ================================================= */}
        {/* NOME */}
        {/* ================================================= */}

        <View className="mt-8">
          <Text className="mb-2 text-[10px] font-semibold text-gray-500">
            NOME *
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome completo"
            placeholderTextColor="#999"
            autoCapitalize="words"
            className="h-[52px] rounded-xl border border-gray-200 px-4 text-[13px] text-black"
          />
        </View>

        {/* ================================================= */}
        {/* TELEFONE */}
        {/* ================================================= */}

        <View className="mt-5">
          <Text className="mb-2 text-[10px] font-semibold text-gray-500">
            TELEFONE
          </Text>

          <TextInput
            value={formatPhone(phone)}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            className="h-[52px] rounded-xl border border-gray-200 px-4 text-[13px] text-black"
          />
        </View>

        {/* ================================================= */}
        {/* ESPECIALIDADE */}
        {/* ================================================= */}

        <View className="mt-5">
          <View className="mb-2 flex-row items-center">
            <Text className="text-[10px] font-semibold text-gray-500">
              ESPECIALIDADE *
            </Text>

            <BriefcaseBusiness
              size={12}
              color="#999"
              className="ml-2"
            />
          </View>

          <TextInput
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="Ex.: Cabeleireiro, Manicure..."
            placeholderTextColor="#999"
            className="h-[52px] rounded-xl border border-gray-200 px-4 text-[13px] text-black"
          />
        </View>

        {/* ================================================= */}
        {/* BIO */}
        {/* ================================================= */}

        <View className="mt-5">
          <Text className="mb-2 text-[10px] font-semibold text-gray-500">
            BIO
          </Text>

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Breve descrição profissional..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            className="h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-[13px] text-black"
          />
        </View>

        {/* ================================================= */}
        {/* HORÁRIOS */}
        {/* ================================================= */}

        <View className="mt-8">

          <Text className="text-[10px] font-semibold text-gray-500">
            HORÁRIOS DE TRABALHO
          </Text>

          <Text className="mt-1 text-[10px] text-gray-400">
            Dias e horários em que o profissional atende
          </Text>

          {loadingHours ? (
            <View className="mt-5 items-center">
              <ActivityIndicator
                size="small"
                color="#000"
              />

              <Text className="mt-2 text-[10px] text-gray-400">
                Carregando horários...
              </Text>
            </View>
          ) : workingHours.length === 0 ? (
            <View className="mt-4 rounded-xl bg-gray-50 p-4">
              <Text className="text-[10px] text-gray-400">
                Nenhum horário configurado para este funcionário.
              </Text>
            </View>
          ) : (
            workingHours
              .sort(
                (a, b) =>
                  a.dayOfWeek - b.dayOfWeek
              )
              .map((hour) => (
                <View
                  key={hour.id}
                  className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
                >
                  <Text className="text-[12px] font-medium text-black">
                    {days[hour.dayOfWeek]}
                  </Text>

                  <Text className="text-[11px] text-gray-500">
                    {String(hour.startTime).slice(
                      0,
                      5
                    )}
                    {" - "}
                    {String(hour.endTime).slice(
                      0,
                      5
                    )}
                  </Text>
                </View>
              ))
          )}
        </View>

        {/* ================================================= */}
        {/* BOTÃO */}
        {/* ================================================= */}

        <TouchableOpacity
          disabled={!canSubmit || isLoading}
          activeOpacity={0.8}
          onPress={handleUpdate}
          className={`mt-7 h-[52px] items-center justify-center rounded-xl ${
            canSubmit && !isLoading
              ? "bg-black"
              : "bg-gray-300"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Text className="text-[12px] font-semibold text-white">
              SALVAR ALTERAÇÕES
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}