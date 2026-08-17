import {
  Search,
  UserRound,
  ChevronRight,
  Plus,
} from "lucide-react-native";

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";
import { useBusinessStore } from "../../store/businessStore";
import { clientApi } from "../../api/clientApi";

export default function ClientsScreen({ navigation }) {
  const businessId = useBusinessStore((state) => state.status?.id);

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      if (!businessId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const result = await clientApi.listByBusiness(businessId);

        setClients(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, [businessId]);

  // BUSCA
  const filteredClients = clients.filter((client) =>
    client?.name
      ?.toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  function renderClient({ item }) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ClientDetails", {
            clientId: item.id,
          })
        }
        className="mb-3 flex-row items-center rounded-xl border border-gray-200 p-4"
      >
        {/* FOTO */}
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {item.photoUrl ? (
            <Image
              source={{ uri: item.photoUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <UserRound
              size={27}
              color="#999"
              strokeWidth={1.8}
            />
          )}
        </View>

        {/* INFORMAÇÕES */}
        <View className="ml-4 flex-1">
          <Text
            numberOfLines={1}
            className="text-[16px] font-semibold text-black"
          >
            {item.name || "Cliente sem nome"}
          </Text>

          {item.phone ? (
            <Text className="mt-1 text-[13px] text-gray-400">
              {item.phone}
            </Text>
          ) : (
            <Text className="mt-1 text-[13px] text-gray-400">
              Sem telefone informado
            </Text>
          )}
        </View>

        <ChevronRight
          size={22}
          color="#999"
          strokeWidth={1.8}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-white px-5 pt-14">

      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-[24px] font-bold text-black">
            Clientes
          </Text>

          <Text className="mt-1 text-[14px] text-gray-400">
            Gerencie seus clientes
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CreateClient")}
          className="h-11 w-11 items-center justify-center rounded-full bg-black"
        >
          <Plus
            size={23}
            color="#fff"
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* BUSCA */}
      <View className="mt-7 h-14 flex-row items-center rounded-xl border border-gray-200 px-4">
        <Search
          size={22}
          color="#999"
          strokeWidth={2}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar cliente..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          className="ml-3 flex-1 text-[14px] text-black"
        />
      </View>

      {/* TÍTULO */}
      <View className="mt-7 flex-row items-center justify-between">
        <Text className="text-[16px] font-semibold text-black">
          Seus clientes
        </Text>

        {!isLoading && clients.length > 0 && (
          <Text className="text-[13px] text-gray-400">
            {filteredClients.length} cliente
            {filteredClients.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* CARREGANDO */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#000"
          />

          <Text className="mt-4 text-[13px] text-gray-400">
            Carregando clientes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderClient}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 30,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8">

              {/* ÍCONE */}
              <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <UserRound
                  size={36}
                  color="#999"
                  strokeWidth={1.7}
                />
              </View>

              {/* TÍTULO */}
              <Text className="mt-5 text-center text-[17px] font-semibold text-black">
                {search.trim()
                  ? "Nenhum cliente encontrado"
                  : "Nenhum cliente cadastrado"}
              </Text>

              {/* DESCRIÇÃO */}
              <Text className="mt-2 text-center text-[13px] leading-5 text-gray-400">
                {search.trim()
                  ? "Tente buscar por outro nome."
                  : "Quando você cadastrar clientes, eles aparecerão aqui."}
              </Text>

              {/* BOTÃO */}
              {!search.trim() && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("CreateClient")
                  }
                  className="mt-5 rounded-xl bg-black px-6 py-3"
                >
                  <Text className="text-[14px] font-semibold text-white">
                    Adicionar cliente
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}