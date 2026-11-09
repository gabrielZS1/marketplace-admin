import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  DollarSign,
  CalendarCheck,
  Users,
  Scissors,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import ErrorState from "../../components/ui/ErrorState";
import { StatsSkeleton } from "../../components/skeletons";
import { businessApi } from "../../api/businessApi";
import { statsApi } from "../../api/statsApi";

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

function brl(value) {
  const n = Number(value || 0);
  return (
    "R$ " +
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function pct(v) {
  return `${Math.round((Number(v) || 0) * 100)}%`;
}

function Section({ icon: Icon, title, children }) {
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center">
        <Icon size={16} color="#111827" strokeWidth={2.2} />
        <Text className="ml-2 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Metric({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "text-green-600"
      : tone === "bad"
      ? "text-red-600"
      : "text-[#111827]";
  return (
    <View className="mb-2 flex-1 rounded-2xl border border-gray-100 bg-white px-4 py-3">
      <Text className="text-[11px] text-gray-500">{label}</Text>
      <Text className={`mt-1 text-[17px] font-bold ${toneClass}`}>{value}</Text>
      {hint ? (
        <Text className="mt-0.5 text-[10px] text-gray-400">{hint}</Text>
      ) : null}
    </View>
  );
}

function Bar({ label, value, total, color = "#111827" }) {
  const width = total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";
  return (
    <View className="mb-2">
      <View className="mb-1 flex-row justify-between">
        <Text className="text-[12px] text-gray-600">{label}</Text>
        <Text className="text-[12px] font-semibold text-[#111827]">{value}</Text>
      </View>
      <View className="h-[6px] overflow-hidden rounded-full bg-gray-100">
        <View
          className="h-full rounded-full"
          style={{ width, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const [businessId, setBusinessId] = useState(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (bId, d) => {
      setIsLoading(true);
      setError(false);
      try {
        const stats = await statsApi.get(bId, d);
        setData(stats);
      } catch (err) {
        console.log("Erro nas estatísticas:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const st = await businessApi.getMyStatus().catch(() => null);
      if (!st?.id) {
        setError(true);
        setIsLoading(false);
        return;
      }
      setBusinessId(st.id);
      load(st.id, days);
    })();
  }, []);

  function changePeriod(d) {
    setDays(d);
    if (businessId) load(businessId, d);
  }

  const a = data?.appointments;
  const r = data?.revenue;
  const c = data?.clients;
  const rev = data?.reviews;
  const busiest = data?.busiest;

  return (
    <Screen navigation={navigation} title="Estatísticas e relatórios">
      {/* PERÍODO */}
      <View className="mb-5 flex-row rounded-full bg-gray-100 p-1">
        {PERIODS.map((p) => {
          const active = p.days === days;
          return (
            <TouchableOpacity
              key={p.days}
              onPress={() => changePeriod(p.days)}
              className={`flex-1 rounded-full py-2 ${active ? "bg-black" : ""}`}
            >
              <Text
                className={`text-center text-[12px] font-semibold ${
                  active ? "text-white" : "text-gray-500"
                }`}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <StatsSkeleton />
      ) : error ? (
        <ErrorState
          message="Não foi possível carregar o relatório"
          onRetry={businessId ? () => load(businessId, days) : undefined}
        />
      ) : !data ? null : a?.total === 0 ? (
        <View className="items-center py-16 px-6">
          <CalendarCheck size={34} color="#9CA3AF" />
          <Text className="mt-3 text-center text-[14px] font-semibold text-[#111827]">
            Nenhum agendamento neste período
          </Text>
          <Text className="mt-1 text-center text-[12px] text-gray-500">
            Os números aparecem aqui assim que os clientes começarem a agendar.
          </Text>
        </View>
      ) : (
        <>
          {/* FATURAMENTO */}
          <Section icon={DollarSign} title="Faturamento">
            <View className="flex-row gap-2">
              <Metric
                label="Realizado"
                value={brl(r.realized)}
                hint="serviços concluídos"
                tone="good"
              />
              <Metric
                label="A receber"
                value={brl(r.upcoming)}
                hint="agendado e por vir"
              />
            </View>
            <View className="flex-row gap-2">
              <Metric label="Ticket médio" value={brl(r.averageTicket)} />
              <Metric
                label="Perdido"
                value={brl(r.lost)}
                hint="cancelados + faltas"
                tone={Number(r.lost) > 0 ? "bad" : "default"}
              />
            </View>
          </Section>

          {/* AGENDAMENTOS */}
          <Section icon={CalendarCheck} title="Agendamentos">
            <View className="mb-3 flex-row gap-2">
              <Metric label="Total" value={a.total} />
              <Metric
                label="Taxa de conclusão"
                value={pct(a.completionRate)}
                tone="good"
              />
              <Metric
                label="Cancelamento"
                value={pct(a.cancellationRate)}
                tone={a.cancellationRate > 0.2 ? "bad" : "default"}
              />
            </View>
            <View className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <Bar label="Concluídos" value={a.completed} total={a.total} color="#16A34A" />
              <Bar label="Confirmados" value={a.confirmed} total={a.total} color="#2563EB" />
              <Bar label="Pendentes" value={a.pending} total={a.total} color="#D97706" />
              <Bar label="Em andamento" value={a.inProgress} total={a.total} color="#7C3AED" />
              <Bar label="Cancelados" value={a.cancelled} total={a.total} color="#DC2626" />
              <Bar label="Faltas (no-show)" value={a.noShow} total={a.total} color="#9CA3AF" />
            </View>
          </Section>

          {/* CLIENTES */}
          <Section icon={Users} title="Clientes">
            <View className="flex-row gap-2">
              <Metric label="Atendidos" value={c.unique} />
              <Metric label="Novos" value={c.newInPeriod} tone="good" />
              <Metric label="Recorrentes" value={c.returning} />
            </View>
          </Section>

          {/* SERVIÇOS */}
          {data.topServices?.length ? (
            <Section icon={Scissors} title="Serviços mais procurados">
              <View className="rounded-2xl border border-gray-100 bg-white">
                {data.topServices.map((s, i) => (
                  <View
                    key={s.name}
                    className={`flex-row items-center px-4 py-3 ${
                      i === data.topServices.length - 1
                        ? ""
                        : "border-b border-gray-100"
                    }`}
                  >
                    <Text className="flex-1 text-[13px] font-medium text-[#111827]">
                      {s.name}
                    </Text>
                    <Text className="mr-3 text-[12px] text-gray-500">
                      {s.count}x
                    </Text>
                    <Text className="text-[13px] font-semibold text-[#111827]">
                      {brl(s.revenue)}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {/* EQUIPE */}
          {data.team?.length ? (
            <Section icon={TrendingUp} title="Desempenho da equipe">
              <View className="rounded-2xl border border-gray-100 bg-white">
                {data.team.map((e, i) => (
                  <View
                    key={e.employeeId}
                    className={`px-4 py-3 ${
                      i === data.team.length - 1 ? "" : "border-b border-gray-100"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[13px] font-semibold text-[#111827]">
                        {e.name}
                      </Text>
                      <Text className="text-[13px] font-semibold text-[#111827]">
                        {brl(e.revenue)}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center">
                      <Text className="text-[11px] text-gray-500">
                        {e.completed}/{e.appointments} concluídos
                      </Text>
                      {e.averageRating ? (
                        <View className="ml-3 flex-row items-center">
                          <Star size={11} color="#F5B301" fill="#F5B301" />
                          <Text className="ml-1 text-[11px] text-gray-500">
                            {e.averageRating.toFixed(1)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {/* AVALIAÇÕES */}
          <Section icon={Star} title="Avaliações">
            <View className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
              <View className="mb-3 flex-row items-baseline">
                <Text className="text-[24px] font-bold text-[#111827]">
                  {rev.average ? rev.average.toFixed(1) : "—"}
                </Text>
                <Text className="ml-2 text-[12px] text-gray-500">
                  média geral · {rev.countInPeriod} no período
                </Text>
              </View>
              {[
                ["5", rev.stars5],
                ["4", rev.stars4],
                ["3", rev.stars3],
                ["2", rev.stars2],
                ["1", rev.stars1],
              ].map(([label, val]) => (
                <Bar
                  key={label}
                  label={`${label} estrelas`}
                  value={val}
                  total={rev.countInPeriod}
                  color="#F5B301"
                />
              ))}
            </View>
          </Section>

          {/* MOVIMENTO */}
          {busiest?.weekday || busiest?.hour != null ? (
            <Section icon={Clock} title="Movimento">
              <View className="flex-row gap-2">
                <Metric
                  label="Dia mais movimentado"
                  value={busiest.weekday ? capitalize(busiest.weekday) : "—"}
                />
                <Metric
                  label="Horário de pico"
                  value={
                    busiest.hour != null
                      ? `${String(busiest.hour).padStart(2, "0")}h`
                      : "—"
                  }
                />
              </View>
            </Section>
          ) : null}

          <Text className="mb-2 mt-2 text-center text-[10px] text-gray-400">
            Período: últimos {data.periodDays} dias
          </Text>
        </>
      )}
    </Screen>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
