import { useState } from "react";
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

import { createEmployee } from "../../api/employeeApi";

export default function CreateEmployeeScreen({ navigation, route }) {
  const businessId = route?.params?.businessId;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");

  const [workingHours, setWorkingHours] = useState([
    {
      dayOfWeek: 1,
      label: "Segunda-feira",
      active: true,
      startTime: "10:00",
      endTime: "19:00",
    },
    {
      dayOfWeek: 2,
      label: "Terça-feira",
      active: true,
      startTime: "10:00",
      endTime: "19:00",
    },
    {
      dayOfWeek: 3,
      label: "Quarta-feira",
      active: true,
      startTime: "10:00",
      endTime: "19:00",
    },
    {
      dayOfWeek: 4,
      label: "Quinta-feira",
      active: true,
      startTime: "10:00",
      endTime: "19:00",
    },
    {
      dayOfWeek: 5,
      label: "Sexta-feira",
      active: true,
      startTime: "10:00",
      endTime: "19:00",
    },
    {
      dayOfWeek: 6,
      label: "Sábado",
      active: false,
      startTime: "10:00",
      endTime: "14:00",
    },
    {
      dayOfWeek: 0,
      label: "Domingo",
      active: false,
      startTime: "10:00",
      endTime: "14:00",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    name.trim().length >= 3 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    specialty.trim().length > 0;

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

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

  function formatTime(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 4);

    if (numbers.length <= 2) {
      return numbers;
    }

    return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
  }

  function isValidTime(value) {
    if (!/^\d{2}:\d{2}$/.test(value)) {
      return false;
    }

    const [hours, minutes] = value.split(":").map(Number);

    return (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    );
  }

  function timeToMinutes(value) {
    const [hours, minutes] = value
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  }

  function toggleWorkingDay(dayOfWeek) {
    setWorkingHours((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              active: !day.active,
            }
          : day
      )
    );
  }

  function updateWorkingTime(
    dayOfWeek,
    field,
    value
  ) {
    const formattedValue = formatTime(value);

    setWorkingHours((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              [field]: formattedValue,
            }
          : day
      )
    );
  }

  function validateWorkingHours() {
    const activeDays = workingHours.filter(
      (day) => day.active
    );

    if (activeDays.length === 0) {
      Alert.alert(
        "Horário de trabalho",
        "Selecione pelo menos um dia de trabalho."
      );

      return false;
    }

    for (const day of activeDays) {
      if (!isValidTime(day.startTime)) {
        Alert.alert(
          "Horário inválido",
          `Informe um horário de entrada válido para ${day.label}.`
        );

        return false;
      }

      if (!isValidTime(day.endTime)) {
        Alert.alert(
          "Horário inválido",
          `Informe um horário de saída válido para ${day.label}.`
        );

        return false;
      }

      if (
        timeToMinutes(day.endTime) <=
        timeToMinutes(day.startTime)
      ) {
        Alert.alert(
          "Horário inválido",
          `O horário de saída deve ser depois da entrada em ${day.label}.`
        );

        return false;
      }
    }

    return true;
  }

  async function handleCreate() {
    if (!businessId) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar a empresa."
      );

      return;
    }

    if (!canSubmit) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha nome, e-mail, telefone e especialidade."
      );

      return;
    }

    if (!validateWorkingHours()) {
      return;
    }

    try {
      setIsLoading(true);

      const employee = await createEmployee(
        businessId,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/\D/g, ""),
          specialty: specialty.trim(),
          bio: bio.trim() || null,

          workingHours: workingHours
            .filter((day) => day.active)
            .map((day) => ({
              dayOfWeek: day.dayOfWeek,
              startTime: day.startTime,
              endTime: day.endTime,
            })),
        }
      );

      Alert.alert(
        "Funcionário cadastrado",
        `O funcionário ${employee.name} foi cadastrado com sucesso.\n\nSenha temporária: ${employee.temporaryPassword}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "Erro ao criar funcionário:",
        error
      );

      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Não foi possível cadastrar o funcionário.";

      Alert.alert(
        "Erro ao cadastrar",
        message
      );
    } finally {
      setIsLoading(false);
    }
  }

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
          paddingBottom: 35,
        }}
      >
        {/* HEADER */}

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
              Novo funcionário
            </Text>

            <Text className="mt-0.5 text-[10px] text-gray-400">
              Cadastre um profissional da equipe
            </Text>
          </View>
        </View>

        {/* ÍCONE */}

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

        {/* NOME */}

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

        {/* EMAIL */}

        <View className="mt-5">
          <Text className="mb-2 text-[10px] font-semibold text-gray-500">
            E-MAIL *
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[52px] rounded-xl border border-gray-200 px-4 text-[13px] text-black"
          />
        </View>

        {/* TELEFONE */}

        <View className="mt-5">
          <Text className="mb-2 text-[10px] font-semibold text-gray-500">
            TELEFONE *
          </Text>

          <TextInput
            value={phone}
            onChangeText={(value) =>
              setPhone(formatPhone(value))
            }
            placeholder="(11) 99999-9999"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            className="h-[52px] rounded-xl border border-gray-200 px-4 text-[13px] text-black"
          />
        </View>

        {/* ESPECIALIDADE */}

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

        {/* BIO */}

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

        {/* HORÁRIOS */}

        <View className="mt-7">
          <Text className="text-[13px] font-bold text-black">
            Horário de trabalho
          </Text>

          <Text className="mt-1 text-[10px] leading-4 text-gray-400">
            Configure os dias e horários em que o
            profissional atende.
          </Text>

          <View className="mt-4">
            {workingHours.map((day) => (
              <View
                key={day.dayOfWeek}
                className="mb-3 rounded-2xl border border-gray-200 bg-white p-4"
              >
                {/* DIA */}

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-[12px] font-semibold text-black">
                      {day.label}
                    </Text>

                    <Text className="mt-0.5 text-[9px] text-gray-400">
                      {day.active
                        ? "Dia de trabalho"
                        : "Folga"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      toggleWorkingDay(
                        day.dayOfWeek
                      )
                    }
                    className={`h-7 w-12 justify-center rounded-full px-1 ${
                      day.active
                        ? "bg-black"
                        : "bg-gray-200"
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded-full bg-white ${
                        day.active
                          ? "self-end"
                          : "self-start"
                      }`}
                    />
                  </TouchableOpacity>
                </View>

                {/* HORÁRIOS */}

                {day.active && (
                  <View className="mt-4 flex-row items-center">
                    <View className="flex-1">
                      <Text className="mb-1.5 text-[9px] font-semibold text-gray-400">
                        ENTRADA
                      </Text>

                      <TextInput
                        value={day.startTime}
                        onChangeText={(value) =>
                          updateWorkingTime(
                            day.dayOfWeek,
                            "startTime",
                            value
                          )
                        }
                        placeholder="10:00"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                        className="h-11 rounded-xl border border-gray-200 px-3 text-[12px] text-black"
                      />
                    </View>

                    <Text className="mx-3 mt-5 text-[11px] text-gray-400">
                      até
                    </Text>

                    <View className="flex-1">
                      <Text className="mb-1.5 text-[9px] font-semibold text-gray-400">
                        SAÍDA
                      </Text>

                      <TextInput
                        value={day.endTime}
                        onChangeText={(value) =>
                          updateWorkingTime(
                            day.dayOfWeek,
                            "endTime",
                            value
                          )
                        }
                        placeholder="19:00"
                        placeholderTextColor="#999"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                        className="h-11 rounded-xl border border-gray-200 px-3 text-[12px] text-black"
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* AVISO */}

        <View className="mt-5 rounded-xl bg-gray-50 p-4">
          <Text className="text-[10px] leading-4 text-gray-500">
            Uma senha temporária será gerada
            automaticamente para o funcionário.
            Após o cadastro, você poderá repassar
            os dados de acesso para ele.
          </Text>
        </View>

        {/* BOTÃO */}

        <TouchableOpacity
          disabled={!canSubmit || isLoading}
          activeOpacity={0.8}
          onPress={handleCreate}
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
              CADASTRAR FUNCIONÁRIO
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}