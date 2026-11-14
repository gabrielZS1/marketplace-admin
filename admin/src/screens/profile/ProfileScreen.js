import {
  ChevronRight,
  ChevronDown,
  Star,
  TrendingUp,
  Check,
  Image as ImageIcon,
  Camera,
  FileText,
  Scissors,
  Users,
  Clock,
} from "lucide-react-native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { businessApi } from "../../api/businessApi";
import { serviceApi } from "../../api/serviceApi";
import { getEmployees } from "../../api/employeeApi";
import { mediaUrl } from "../../utils/mediaUrl";

import BusinessSettingsMenu from "./BusinessSettingsMenu";
import Skeleton from "../../components/ui/Skeleton";
import logger from "../../utils/logger";

function buildChecklist(details, services, employees) {
  return [
    {
      key: "logo",
      label: "Adicionar foto de perfil",
      icon: ImageIcon,
      done: !!details?.logoUrl,
      target: "BusinessDetails",
    },
    {
      key: "description",
      label: "Escrever a descrição da empresa",
      icon: FileText,
      done: !!details?.description && details.description.trim().length > 0,
      target: "BusinessDetails",
    },
    {
      key: "workspace",
      label: "Fotos do espaço de trabalho",
      icon: Camera,
      done: (details?.workspacePhotos?.length ?? 0) > 0,
      target: "BusinessDetails",
    },
    {
      key: "portfolio",
      label: "Adicionar trabalhos ao portfólio",
      icon: Camera,
      done: (details?.portfolioPhotos?.length ?? 0) > 0,
      target: "BusinessDetails",
    },
    {
      key: "services",
      label: "Cadastrar seus serviços",
      icon: Scissors,
      done: (services?.length ?? 0) > 0,
      target: "ManageServices",
    },
    {
      key: "employees",
      label: "Adicionar um funcionário",
      icon: Users,
      done: (employees?.length ?? 0) > 0,
      target: "Funcionarios",
    },
  ];
}

export default function ProfileScreen({ navigation }) {
  const [status, setStatus] = useState(null);
  const [details, setDetails] = useState(null);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const st = await businessApi.getMyStatus();
      setStatus(st);
      if (st?.id) {
        const [det, svc, emp] = await Promise.all([
          businessApi.getDetails(st.id).catch(() => null),
          serviceApi.list(st.id).catch(() => []),
          getEmployees(st.id).catch(() => []),
        ]);
        setDetails(det);
        setServices(Array.isArray(svc) ? svc : []);
        setEmployees(Array.isArray(emp) ? emp : []);
      }
    } catch (err) {
      logger.log("Erro ao carregar perfil:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const checklist = buildChecklist(details, services, employees);
  const completedSteps = checklist.filter((c) => c.done).length;
  const totalSteps = checklist.length;
  const allDone = completedSteps === totalSteps;
  const progress = (completedSteps / totalSteps) * 100;

  const rating = details?.rating;
  const reviewCount = details?.reviewCount ?? 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* CAPA + FOTO */}
        <View className="h-[210px] bg-gray-200">
          {isLoading ? (
            <Skeleton radius={0} style={StyleSheet.absoluteFill} />
          ) : details?.workspacePhotos?.[0] ? (
            <Image
              source={{ uri: mediaUrl(details.workspacePhotos[0]) }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}

          <View className="absolute -bottom-9 left-0 right-0 items-center">
            <View className="h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-gray-300">
              {isLoading ? (
                <Skeleton circle width={76} />
              ) : details?.logoUrl ? (
                <Image
                  source={{ uri: mediaUrl(details.logoUrl) }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <ImageIcon size={26} color="#9CA3AF" />
              )}
            </View>

            {isLoading ? (
              <Skeleton width={130} height={22} radius={999} style={{ marginTop: -3 }} />
            ) : (
            <View className="mt-[-3px] flex-row items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
              <Star
                size={11}
                color={rating ? "#F5B301" : "#B0B0B0"}
                fill={rating ? "#F5B301" : "#B0B0B0"}
              />
              <Text className="ml-1 text-[10px] font-medium text-gray-600">
                {rating
                  ? `${rating.toFixed(1)} · ${reviewCount} ${
                      reviewCount === 1 ? "avaliação" : "avaliações"
                    }`
                  : "Ainda não há avaliações"}
              </Text>
            </View>
            )}
          </View>
        </View>

        <View className="px-5">
          <View className="mt-14 items-center">
            {isLoading ? (
              <Skeleton width={170} height={20} style={{ marginVertical: 3 }} />
            ) : (
              <Text className="text-[19px] font-bold text-black">
                {status?.name || "Minha empresa"}
              </Text>
            )}
          </View>

          {/* CARD: COMPLETAR CADASTRO */}
          <View
            className="mt-5 rounded-2xl border border-gray-200 bg-white"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setExpanded((v) => !v)}
              className="flex-row items-center px-5 py-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-1">
                  <Skeleton width="80%" height={15} style={{ marginVertical: 2 }} />
                  <Skeleton width="35%" height={11} style={{ marginTop: 6 }} />
                </View>
              ) : (
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-black">
                  {allDone
                    ? "Cadastro do estabelecimento completo"
                    : "Complete o cadastro do seu estabelecimento"}
                </Text>
                <Text className="mt-0.5 text-[11px] text-gray-500">
                  {allDone
                    ? "Tudo certo — seu perfil está completo"
                    : `${completedSteps} de ${totalSteps} concluído`}
                </Text>
              </View>
              )}

              {isLoading ? null : allDone ? (
                <View className="h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Check size={14} color="#16A34A" strokeWidth={3} />
                </View>
              ) : expanded ? (
                <ChevronDown size={18} color="#777" />
              ) : (
                <ChevronRight size={18} color="#777" />
              )}
            </TouchableOpacity>

            {!isLoading && !allDone ? (
              <View className="px-5 pb-2">
                <View className="h-[7px] overflow-hidden rounded-full bg-gray-200">
                  <View
                    className="h-full rounded-full bg-black"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            ) : null}

            {expanded ? (
              <View className="border-t border-gray-100 px-3 py-1">
                {checklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate(item.target)}
                      className="flex-row items-center px-2 py-3"
                    >
                      <View
                        className={`h-7 w-7 items-center justify-center rounded-full ${
                          item.done ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {item.done ? (
                          <Check size={14} color="#16A34A" strokeWidth={3} />
                        ) : (
                          <Icon size={14} color="#6B7280" strokeWidth={2} />
                        )}
                      </View>
                      <Text
                        className={`ml-3 flex-1 text-[13px] ${
                          item.done
                            ? "text-gray-400 line-through"
                            : "font-medium text-[#111827]"
                        }`}
                      >
                        {item.label}
                      </Text>
                      {!item.done ? (
                        <ChevronRight size={16} color="#9CA3AF" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* CARD: ESTATÍSTICAS */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate("Stats")}
            className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-5 py-5"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            <View className="h-11 w-11 items-center justify-center">
              <TrendingUp size={28} color="#000" strokeWidth={2} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[14px] font-semibold text-black">
                Estatísticas e relatórios
              </Text>
              <Text className="mt-1 text-[11px] leading-4 text-gray-400">
                Faturamento, agendamentos, serviços e desempenho da equipe
              </Text>
            </View>
            <ChevronRight size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BusinessSettingsMenu navigation={navigation} />
    </View>
  );
}
