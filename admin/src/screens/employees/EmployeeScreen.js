import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Plus,
  UserRound,
  MoreVertical,
} from "lucide-react-native";

import {
  getEmployees,
  deleteEmployee,
} from "../../api/employeeApi";

import { useBusinessStore } from "../../store/businessStore";

export default function EmployeeScreen({ navigation }) {
  const businessStatus = useBusinessStore(
    (state) => state.status
  );

  const businessId = businessStatus?.id;

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadEmployees() {
    if (!businessId) {
      console.log("❌ businessId não encontrado");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getEmployees(businessId);

      setEmployees(response || []);
    } catch (error) {
      console.log(
        "❌ Erro ao carregar funcionários:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível carregar os funcionários."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, [businessId]);

  function handleAddEmployee() {
    if (!navigation) {
      console.log("❌ navigation está undefined");
      return;
    }

    navigation.navigate("CreateEmployee", {
      businessId,
    });
  }

  function handleEmployee(employee) {
    Alert.alert(
      employee.name,
      "O que deseja fazer?",
      [
        {
          text: "Editar",
          onPress: () => {
            navigation.navigate("EditEmployee", {
              businessId,
              employee,
            });
          },
        },
        {
          text: "Desativar",
          style: "destructive",
          onPress: () => handleDeactivate(employee),
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  }

  async function handleDeactivate(employee) {
    try {
      await deleteEmployee(
        businessId,
        employee.id
      );

      setEmployees((current) =>
        current.filter(
          (item) => item.id !== employee.id
        )
      );

      Alert.alert(
        "Funcionário desativado",
        `${employee.name} foi desativado.`
      );
    } catch (error) {
      console.log(
        "❌ Erro ao desativar funcionário:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível desativar o funcionário."
      );
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator
          size="small"
          color="#000"
        />

        <Text className="mt-3 text-[11px] text-gray-400">
          Carregando funcionários...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">

      {/* HEADER */}

      <View className="px-5 pb-4 pt-14">

        <View className="flex-row items-center justify-between">

          <View>
            <Text className="text-[22px] font-bold text-black">
              Funcionários
            </Text>

            <Text className="mt-1 text-[10px] text-gray-400">
              Gerencie sua equipe
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddEmployee}
            className="h-10 w-10 items-center justify-center rounded-full bg-black"
          >
            <Plus
              size={21}
              color="#fff"
              strokeWidth={2}
            />
          </TouchableOpacity>

        </View>

      </View>

      {/* SEM BUSINESS ID */}

      {!businessId ? (
        <View className="flex-1 items-center justify-center px-8">

          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <UserRound
              size={28}
              color="#999"
              strokeWidth={1.7}
            />
          </View>

          <Text className="mt-4 text-[15px] font-semibold text-black">
            Empresa não identificada
          </Text>

          <Text className="mt-1 text-center text-[10px] leading-4 text-gray-400">
            Não foi possível identificar a empresa
            vinculada à sua conta.
          </Text>

        </View>
      ) : employees.length === 0 ? (

        /* NENHUM FUNCIONÁRIO */

        <View className="flex-1 items-center justify-center px-8">

          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">

            <UserRound
              size={28}
              color="#999"
              strokeWidth={1.7}
            />

          </View>

          <Text className="mt-4 text-[15px] font-semibold text-black">
            Nenhum funcionário
          </Text>

          <Text className="mt-1 text-center text-[10px] leading-4 text-gray-400">
            Cadastre os profissionais que fazem parte
            da sua equipe.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddEmployee}
            className="mt-5 flex-row items-center rounded-xl bg-black px-5 py-3"
          >

            <Plus
              size={16}
              color="#fff"
            />

            <Text className="ml-2 text-[11px] font-semibold text-white">
              Adicionar funcionário
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        /* LISTA */

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
        >

          <Text className="mb-3 text-[10px] font-medium text-gray-400">
            {employees.length}{" "}
            {employees.length === 1
              ? "PROFISSIONAL"
              : "PROFISSIONAIS"}
          </Text>

          {employees.map((employee) => (

            <TouchableOpacity
              key={employee.id}
              activeOpacity={0.8}
              onPress={() =>
                handleEmployee(employee)
              }
              className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.03,
                shadowRadius: 5,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                elevation: 1,
              }}
            >

              {/* FOTO */}

              <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                <UserRound
                  size={22}
                  color="#777"
                  strokeWidth={1.7}
                />

              </View>

              {/* INFORMAÇÕES */}

              <View className="ml-3 flex-1">

                <View className="flex-row items-center">

                  <Text
                    numberOfLines={1}
                    className="flex-1 text-[13px] font-bold text-black"
                  >
                    {employee.name}
                  </Text>

                  <View className="ml-2 flex-row items-center">

                    <View className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    <Text className="ml-1 text-[8px] text-gray-400">
                      Ativo
                    </Text>

                  </View>

                </View>

                {employee.specialty && (
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-[10px] text-gray-400"
                  >
                    {employee.specialty}
                  </Text>
                )}

                {employee.bio && (
                  <Text
                    numberOfLines={1}
                    className="mt-0.5 text-[9px] text-gray-400"
                  >
                    {employee.bio}
                  </Text>
                )}

                {employee.rating != null && (
                  <Text className="mt-1 text-[9px] text-gray-500">
                    ★{" "}
                    {Number(employee.rating).toFixed(1)}
                  </Text>
                )}

              </View>

              {/* MENU */}

              <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-50">

                <MoreVertical
                  size={17}
                  color="#777"
                />

              </View>

            </TouchableOpacity>

          ))}

        </ScrollView>
      )}

    </View>
  );
}