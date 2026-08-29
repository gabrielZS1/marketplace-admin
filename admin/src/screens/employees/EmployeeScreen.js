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
  Pencil,
  UserMinus,
} from "lucide-react-native";

import {
  getEmployees,
  deleteEmployee,
} from "../../api/employeeApi";

import { useBusinessStore } from "../../store/businessStore";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { useIsOwner } from "../../hooks/useRole";
import ErrorState from "../../components/ui/ErrorState";
import ActionSheet from "../../components/ui/ActionSheet";

export default function EmployeeScreen({ navigation }) {
  const businessStatus = useBusinessStore(
    (state) => state.status
  );

  const businessId = businessStatus?.id;
  const topPad = useContentTopPadding();
  const isOwner = useIsOwner();

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [denied, setDenied] = useState(false);
  const [menuFor, setMenuFor] = useState(null);

  async function loadEmployees() {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(false);
      const response = await getEmployees(businessId);
      setEmployees(response || []);
    } catch (error) {
      console.log("Erro ao carregar funcionários:", error);
      if (error?.response?.status === 403) setDenied(true);
      else setLoadError(true);
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

  function confirmDeactivate(employee) {
    Alert.alert(
      "Desativar funcionário",
      `${employee.name} perde o acesso ao app e sai da equipe. Você pode cadastrar de novo depois.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: () => handleDeactivate(employee),
        },
      ],
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
    <View className="px-5 pb-6" style={{ paddingTop: topPad }}>
      <View className="flex-row items-center justify-between">

        <View className="flex-1">
          <Text className="text-[26px] font-bold tracking-[-0.6px] text-black">
            Funcionários
          </Text>

          <Text className="mt-1.5 text-[12px] text-gray-400">
            Gerencie sua equipe
          </Text>
        </View>

        {isOwner ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddEmployee}
            className="h-12 w-12 items-center justify-center rounded-full bg-black"
          >
            <Plus size={23} color="#fff" strokeWidth={2.2} />
          </TouchableOpacity>
        ) : null}

      </View>
    </View>

    {/* ERRO AO CARREGAR */}
    {denied ? (
      <ErrorState
        variant="denied"
        message="Só o dono do estabelecimento pode ver isso"
        hint="Fale com o responsável se precisar."
      />
    ) : loadError && businessId ? (
      <ErrorState
        message="Não foi possível carregar os funcionários"
        onRetry={loadEmployees}
        loading={isLoading}
      />
    ) : !businessId ? (

      <View className="flex-1 items-center justify-center px-8">

        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <UserRound
            size={34}
            color="#999"
            strokeWidth={1.6}
          />
        </View>

        <Text className="mt-6 text-[18px] font-bold text-black">
          Empresa não identificada
        </Text>

        <Text className="mt-2 max-w-[290px] text-center text-[12px] leading-5 text-gray-400">
          Não foi possível identificar a empresa
          vinculada à sua conta.
        </Text>

      </View>

    ) : employees.length === 0 ? (

      /* NENHUM FUNCIONÁRIO */
      <View className="flex-1 items-center justify-center px-8">

        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <UserRound
            size={34}
            color="#999"
            strokeWidth={1.6}
          />
        </View>

        <Text className="mt-6 text-[18px] font-bold text-black">
          Nenhum funcionário
        </Text>

        <Text className="mt-2 max-w-[300px] text-center text-[12px] leading-5 text-gray-400">
          {isOwner
            ? "Cadastre os profissionais que fazem parte da sua equipe para começar a gerenciá-los."
            : "Nenhum profissional cadastrado neste estabelecimento ainda."}
        </Text>

        {isOwner ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddEmployee}
            className="mt-7 flex-row items-center rounded-xl bg-black px-6 py-4"
          >
            <Plus size={18} color="#fff" strokeWidth={2.2} />
            <Text className="ml-2.5 text-[12px] font-bold text-white">
              Adicionar funcionário
            </Text>
          </TouchableOpacity>
        ) : null}

      </View>

    ) : (

      /* LISTA */
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110,
        }}
      >

        {/* RESUMO */}
        <View className="mb-5 flex-row items-center justify-between">

          <View>
            <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-gray-400">
              Sua equipe
            </Text>

            <Text className="mt-1.5 text-[15px] font-semibold text-black">
              {employees.length}{" "}
              {employees.length === 1
                ? "profissional"
                : "profissionais"}
            </Text>
          </View>

          <View className="flex-row items-center rounded-full bg-gray-100 px-3.5 py-2">

            <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />

            <Text className="text-[10px] font-medium text-gray-500">
              Equipe ativa
            </Text>

          </View>

        </View>

        {/* LISTA DE FUNCIONÁRIOS */}
        {employees.map((employee) => (

          <TouchableOpacity
            key={employee.id}
            activeOpacity={isOwner ? 0.85 : 1}
            onPress={isOwner ? () => setMenuFor(employee) : undefined}
            className="mb-4 flex-row items-center rounded-2xl border border-gray-100 bg-white p-5"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.035,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              elevation: 1,
            }}
          >

            {/* AVATAR */}
            <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-gray-100">

              {employee.name ? (
                <Text className="text-[20px] font-bold text-gray-500">
                  {employee.name
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              ) : (
                <UserRound
                  size={25}
                  color="#777"
                  strokeWidth={1.7}
                />
              )}

            </View>

            {/* INFORMAÇÕES */}
            <View className="ml-4 flex-1">

              {/* NOME + STATUS */}
              <View className="flex-row items-center">

                <Text
                  numberOfLines={1}
                  className="flex-1 text-[15px] font-bold text-black"
                >
                  {employee.name}
                </Text>

                <View className="ml-2 flex-row items-center rounded-full bg-green-50 px-2.5 py-1.5">

                  <View className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  <Text className="ml-1.5 text-[9px] font-semibold text-green-600">
                    Ativo
                  </Text>

                </View>

              </View>

              {/* ESPECIALIDADE */}
              {employee.specialty && (
                <Text
                  numberOfLines={1}
                  className="mt-1.5 text-[12px] font-medium text-gray-500"
                >
                  {employee.specialty}
                </Text>
              )}

              {/* BIO */}
              {employee.bio && (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-[11px] text-gray-400"
                >
                  {employee.bio}
                </Text>
              )}

              {/* AVALIAÇÃO */}
              {employee.rating != null && (
                <View className="mt-1.5 flex-row items-center">

                  <Text className="text-[11px] text-black">
                    ★
                  </Text>

                  <Text className="ml-1 text-[10px] font-medium text-gray-500">
                    {Number(employee.rating).toFixed(1)}
                  </Text>

                </View>
              )}

            </View>

            {/* MENU */}
            <View className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-50">

              <MoreVertical
                size={19}
                color="#777"
                strokeWidth={2}
              />

            </View>

          </TouchableOpacity>

        ))}

      </ScrollView>
    )}

    <ActionSheet
      visible={!!menuFor}
      onClose={() => setMenuFor(null)}
      title={menuFor?.name}
      message="O que deseja fazer?"
      actions={[
        {
          label: "Editar",
          icon: Pencil,
          onPress: () =>
            navigation.navigate("EditEmployee", { businessId, employee: menuFor }),
        },
        {
          label: "Desativar",
          icon: UserMinus,
          destructive: true,
          onPress: () => confirmDeactivate(menuFor),
        },
      ]}
    />

  </View>
)};