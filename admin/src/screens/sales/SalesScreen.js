import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronRight, Plus, Tag, UserRound } from "lucide-react-native";

export default function CreateSaleScreen({ navigation }) {
  const [client, setClient] = useState(null);
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState("");

  function handleAddItem() {
    // Futuramente abrirá a seleção de produto/serviço
    console.log("Adicionar item");
  }

  function handleDiscount() {
    // Futuramente abrirá a configuração do desconto
    console.log("Adicionar desconto");
  }

  function handleClient() {
    // Futuramente abrirá a lista de clientes vinda do banco
    console.log("Selecionar cliente");
  }

  const hasValue = amount.length > 0;

  return (
    <View className="flex-1 bg-white px-5 pt-14">

      {/* HEADER */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-5"
        >
          <Text className="text-[26px] font-medium text-black">
            ×
          </Text>
        </TouchableOpacity>

        <Text className="text-[22px] font-bold text-black">
          Vendas
        </Text>
      </View>

      {/* CLIENTE */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleClient}
        className="mt-8 h-[72px] flex-row items-center rounded-xl border border-gray-300 px-3"
      >
        {/* FOTO */}
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          <UserRound
            size={28}
            color="#aaa"
            strokeWidth={1.5}
          />
        </View>

        {/* TEXTO */}
        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-[12px] text-gray-400"
          >
            {client?.name || "Selecione um cliente ou deixe"}
          </Text>

          <Text
            numberOfLines={1}
            className="text-[12px] text-gray-400"
          >
            {client?.name
              ? client.phone || "Cliente selecionado"
              : "em branco para chegada"}
          </Text>
        </View>

        <ChevronRight
          size={22}
          color="#999"
          strokeWidth={1.8}
        />
      </TouchableOpacity>

      {/* VALOR */}
      <View className="relative mt-7">

        {/* LABEL */}
        <View className="absolute left-4 top-[-6px] z-10 bg-white px-1">
          <Text className="text-[7px] text-gray-400">
            QUANTIA DEVIDA
          </Text>
        </View>

        <View className="h-[52px] flex-row items-center rounded-xl border border-gray-300 px-3">

          <Text className="text-[15px] font-semibold text-gray-400">
            R$
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor="#111"
            className="ml-4 flex-1 text-[17px] font-semibold text-black"
          />

        </View>
      </View>

      {/* AÇÕES */}
      <View className="mt-6 flex-row items-center">

        {/* ADICIONAR ITEM */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAddItem}
          className="mr-8 flex-row items-center"
        >
          <View className="h-6 w-6 items-center justify-center rounded-full border border-gray-400">
            <Plus
              size={15}
              color="#000"
              strokeWidth={1.8}
            />
          </View>

          <Text className="ml-2 text-[10px] font-semibold text-black">
            Adicionar item
          </Text>
        </TouchableOpacity>

        {/* DESCONTO */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDiscount}
          className="flex-row items-center"
        >
          <View className="h-6 w-6 items-center justify-center rounded-full border border-gray-300">
            <Tag
              size={13}
              color="#000"
              strokeWidth={1.8}
            />
          </View>

          <Text className="ml-2 text-[10px] font-semibold text-black">
            Desconto
          </Text>
        </TouchableOpacity>

      </View>

      {/* ESPAÇO PARA FUTUROS ITENS */}
      {items.length > 0 && (
        <View className="mt-7">
          {items.map((item, index) => (
            <View
              key={item.id || index}
              className="mb-3 rounded-xl border border-gray-200 p-4"
            >
              <Text className="text-[14px] font-semibold text-black">
                {item.name}
              </Text>

              <Text className="mt-1 text-[12px] text-gray-400">
                R$ {item.price}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* BOTÃO CONTINUAR */}
      <View className="mt-auto pb-6 mb-4">
        <TouchableOpacity
          disabled={!hasValue}
          activeOpacity={0.8}
          onPress={() => {
            console.log({
              client,
              amount,
              items,
              discount,
            });

            // Futuramente:
            // navigation.navigate("SaleConfirmation", {...})
          }}
          className={`h-[52px] items-center justify-center rounded-xl ${
            hasValue ? "bg-[#292929]" : "bg-gray-300"
          }`}
        >
          <Text className="text-[13px] font-semibold text-white ">
            {hasValue
              ? `R$ ${amount || "0,00"} - CONTINUAR`
              : "R$ 0,00 - CONTINUAR"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}