import {
  Search,
  UserRound,
} from "lucide-react-native";

import {
  Text,
  TextInput,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";

import { useCallback, useEffect, useState } from "react";
import { useBusinessStore } from "../../store/businessStore";
import { useContentTopPadding } from "../../hooks/useContentTopPadding";
import { useIsOwner } from "../../hooks/useRole";
import { clientApi } from "../../api/clientApi";
import { mediaUrl } from "../../utils/mediaUrl";
import ErrorState from "../../components/ui/ErrorState";

export default function ClientsScreen({ navigation }) {
  const businessId = useBusinessStore((state) => state.status?.id);
  const topPad = useContentTopPadding();
  const isOwner = useIsOwner();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [denied, setDenied] = useState(false);

  const loadClients = useCallback(async () => {
    if (!businessId || !isOwner) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setLoadError(false);
      const result = await clientApi.listByBusiness(businessId);
      setClients(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("Erro ao carregar clientes:", error);
      if (error?.response?.status === 403) setDenied(true);
      else setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, isOwner]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // BUSCA
  const filteredClients = clients.filter((client) =>
    client?.name
      ?.toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  function renderClient({ item }) {
    return (
      <View className="mb-3 flex-row items-center rounded-xl border border-gray-200 p-4">
        {/* FOTO */}
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {item.photoUrl ? (
            <Image
              source={{ uri: mediaUrl(item.photoUrl) }}
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
      </View>
    );
  }

  if (!isOwner || denied) {
    return (
      <View className="flex-1 bg-white px-5" style={{ paddingTop: topPad }}>
        <Text className="text-[24px] font-bold text-black">Clientes</Text>
        <ErrorState
          variant="denied"
          message="Só o dono do estabelecimento pode ver a lista de clientes"
          hint="Ela tem os contatos dos clientes. Fale com o responsável se precisar."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-5" style={{ paddingTop: topPad }}>

      {/* HEADER */}
      <View>
        <Text className="text-[24px] font-bold text-black">
          Clientes
        </Text>

        <Text className="mt-1 text-[14px] text-gray-400">
          Quem já agendou com você
        </Text>
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
      ) : loadError ? (
        <ErrorState
          message="Não foi possível carregar os clientes"
          onRetry={loadClients}
        />
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
                  : "Assim que alguém agendar um horário, o cliente aparece aqui."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}