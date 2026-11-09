import { View } from "react-native";
import Skeleton, { SkeletonGroup } from "../ui/Skeleton";

/**
 * Skeletons prontos de cada tela. Cada um imita o layout real
 * (mesmos paddings, bordas e tamanhos) pra não "pular" quando os dados chegam.
 */

const range = (n) => Array.from({ length: n }, (_, i) => i);

// ---------------- VISÃO GERAL ----------------
export function UpcomingAppointmentsSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando atendimentos" className="mt-4">
      {range(count).map((i) => (
        <View
          key={i}
          className={`rounded-2xl border border-gray-200 p-4 ${i !== count - 1 ? "mb-3" : ""}`}
        >
          <View className="flex-row items-center">
            <Skeleton circle width={40} />
            <View className="ml-3 flex-1">
              <Skeleton width="55%" height={12} />
              <Skeleton width="38%" height={9} style={{ marginTop: 6 }} />
            </View>
            <View className="items-end">
              <Skeleton width={38} height={13} />
              <Skeleton width={30} height={8} style={{ marginTop: 5 }} />
            </View>
          </View>
          <View className="mt-4 flex-row items-center justify-between border-t border-gray-100 pt-3">
            <Skeleton width={90} height={9} />
            <Skeleton width={62} height={18} radius={999} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- CLIENTES ----------------
export function ClientListSkeleton({ count = 6 }) {
  return (
    <SkeletonGroup label="Carregando clientes" style={{ paddingTop: 16 }}>
      {range(count).map((i) => (
        <View key={i} className="mb-3 flex-row items-center rounded-xl border border-gray-200 p-4">
          <Skeleton circle width={56} />
          <View className="ml-4 flex-1">
            <Skeleton width={i % 2 ? "50%" : "65%"} height={15} />
            <Skeleton width="40%" height={11} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- FUNCIONÁRIOS ----------------
export function EmployeeListSkeleton({ count = 4 }) {
  return (
    <SkeletonGroup label="Carregando funcionários" style={{ paddingHorizontal: 20 }}>
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Skeleton width={78} height={10} />
          <Skeleton width={110} height={14} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={104} height={30} radius={999} />
      </View>
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-4 flex-row items-center rounded-2xl border border-gray-100 bg-white p-5"
        >
          <Skeleton circle width={58} />
          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Skeleton width={i % 2 ? "45%" : "60%"} height={15} />
              <Skeleton width={46} height={20} radius={999} style={{ marginLeft: 8 }} />
            </View>
            <Skeleton width="42%" height={11} style={{ marginTop: 8 }} />
            <Skeleton width="68%" height={10} style={{ marginTop: 6 }} />
          </View>
          <Skeleton circle width={40} style={{ marginLeft: 12 }} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

// Lista simples de horários (Editar funcionário)
export function HourRowsSkeleton({ count = 5 }) {
  return (
    <SkeletonGroup label="Carregando horários">
      {range(count).map((i) => (
        <View
          key={i}
          className="mt-2 flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
        >
          <Skeleton width={70} height={12} />
          <Skeleton width={84} height={11} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

// Dias da semana com início/fim (Horário de trabalho do funcionário)
export function WorkingDaysSkeleton({ count = 7 }) {
  return (
    <SkeletonGroup label="Carregando horários">
      {range(count).map((i) => (
        <View key={i} className="mb-3 rounded-2xl border border-gray-200 bg-white">
          <View className="flex-row items-center px-4 py-4">
            <Skeleton circle width={28} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Skeleton width={96} height={13} />
              <Skeleton width={64} height={8} style={{ marginTop: 6 }} />
            </View>
            <Skeleton width={66} height={20} radius={999} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- AGENDA ----------------
// Blocos de agendamento "fantasma" posicionados na timeline.
const AGENDA_GHOSTS = [
  { at: 0.25, h: 0.9 },
  { at: 1.5, h: 0.7 },
  { at: 2.5, h: 1.2 },
  { at: 4.25, h: 0.8 },
  { at: 6, h: 1 },
];

export function AgendaBlocksSkeleton({ hourHeight }) {
  return AGENDA_GHOSTS.map((g, i) => (
    <View
      key={i}
      style={{
        position: "absolute",
        top: g.at * hourHeight,
        height: g.h * hourHeight - 5,
        left: 8,
        right: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
      }}
      className="overflow-hidden rounded-lg px-3 py-3"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Skeleton width={78} height={10} />
      <Skeleton width={i % 2 ? "38%" : "52%"} height={14} style={{ marginTop: 7 }} />
      {g.h >= 0.9 ? <Skeleton width="30%" height={10} style={{ marginTop: 7 }} /> : null}
    </View>
  ));
}

export function NotificationListSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando notificações" style={{ padding: 20, paddingBottom: 35 }}>
      {range(count).map((i) => (
        <View key={i} className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <Skeleton circle width={40} />
              <View className="ml-3 flex-1">
                <Skeleton width="55%" height={13} />
                <Skeleton width="35%" height={9} style={{ marginTop: 6 }} />
              </View>
            </View>
            <Skeleton width={64} height={20} radius={999} />
          </View>
          <View className="mt-4 flex-row">
            <View className="flex-1">
              <Skeleton width={84} height={10} />
            </View>
            <View className="flex-1">
              <Skeleton width={56} height={10} />
            </View>
          </View>
          <Skeleton width={110} height={10} style={{ marginTop: 10 }} />
          {i === 0 ? (
            <View className="mt-4 flex-row">
              <Skeleton height={40} radius={12} style={{ flex: 1, marginRight: 8 }} />
              <Skeleton height={40} radius={12} style={{ flex: 1 }} />
            </View>
          ) : null}
        </View>
      ))}
    </SkeletonGroup>
  );
}

// ---------------- ESTATÍSTICAS ----------------
function MetricSkeleton({ hint }) {
  return (
    <View className="mb-2 flex-1 rounded-2xl border border-gray-100 bg-white px-4 py-3">
      <Skeleton width="55%" height={10} />
      <Skeleton width="75%" height={17} style={{ marginTop: 7 }} />
      {hint ? <Skeleton width="60%" height={8} style={{ marginTop: 6 }} /> : null}
    </View>
  );
}

function SectionTitleSkeleton({ width = 110 }) {
  return (
    <View className="mb-3 flex-row items-center">
      <Skeleton width={16} height={16} radius={4} />
      <Skeleton width={width} height={12} style={{ marginLeft: 8 }} />
    </View>
  );
}

export function StatsSkeleton() {
  return (
    <SkeletonGroup label="Carregando relatório">
      <View className="mb-6">
        <SectionTitleSkeleton width={100} />
        <View className="flex-row gap-2">
          <MetricSkeleton hint />
          <MetricSkeleton hint />
        </View>
        <View className="flex-row gap-2">
          <MetricSkeleton />
          <MetricSkeleton hint />
        </View>
      </View>

      <View className="mb-6">
        <SectionTitleSkeleton width={120} />
        <View className="mb-3 flex-row gap-2">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </View>
        <View className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
          {range(5).map((i) => (
            <View key={i} className="mb-3">
              <View className="mb-1.5 flex-row justify-between">
                <Skeleton width={90} height={10} />
                <Skeleton width={20} height={10} />
              </View>
              <Skeleton height={6} radius={999} />
            </View>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <SectionTitleSkeleton width={80} />
        <View className="flex-row gap-2">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </View>
      </View>
    </SkeletonGroup>
  );
}

// ---------------- PERSONALIZAR EMPRESA ----------------
export function PhotoRowSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando fotos" className="flex-row" style={{ gap: 10, paddingVertical: 8 }}>
      {range(count).map((i) => (
        <Skeleton key={i} width={96} height={96} radius={16} />
      ))}
    </SkeletonGroup>
  );
}

function FieldSkeleton({ tall = false }) {
  return (
    <View
      className={`mt-4 justify-center rounded-2xl border border-gray-200 px-4 ${
        tall ? "min-h-[96px] py-3" : "h-14"
      }`}
    >
      <Skeleton width={tall ? "80%" : "50%"} height={13} />
      {tall ? <Skeleton width="55%" height={13} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

export function BusinessDetailsSkeleton() {
  return (
    <SkeletonGroup label="Carregando dados da empresa">
      <View className="items-center pb-2">
        <Skeleton circle width={96} />
        <Skeleton width={150} height={17} style={{ marginTop: 12 }} />
        <Skeleton width={90} height={11} style={{ marginTop: 6 }} />
      </View>

      {range(2).map((i) => (
        <View key={i} className="mt-6">
          <Skeleton width={110} height={11} />
          <Skeleton width={170} height={11} style={{ marginTop: 5 }} />
          <View className="flex-row" style={{ gap: 10, paddingVertical: 8 }}>
            {range(3).map((j) => (
              <Skeleton key={j} width={96} height={96} radius={16} />
            ))}
          </View>
        </View>
      ))}

      <Skeleton width={100} height={11} style={{ marginTop: 28, marginBottom: 4 }} />
      <FieldSkeleton />
      <FieldSkeleton tall />
      <FieldSkeleton />
      <FieldSkeleton />
    </SkeletonGroup>
  );
}

// ---------------- CONFIGURAÇÕES ----------------
export function GiftCardListSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando cartões-presente">
      {range(count).map((i) => (
        <View key={i} className="mb-3 rounded-2xl border border-gray-200 p-4">
          <Skeleton width={58} height={16} radius={999} />
          <Skeleton width="55%" height={15} style={{ marginTop: 8 }} />
          <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
          <Skeleton width="85%" height={11} style={{ marginTop: 12 }} />
          <Skeleton width="60%" height={11} style={{ marginTop: 6 }} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

export function IntervalListSkeleton({ count = 2 }) {
  return (
    <SkeletonGroup label="Carregando intervalos">
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-2 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4"
        >
          <Skeleton circle width={36} />
          <View className="ml-3 flex-1">
            <Skeleton width={110} height={15} />
            <Skeleton width={70} height={11} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={18} height={18} radius={4} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

export function DayRowsSkeleton({ count = 7 }) {
  return (
    <SkeletonGroup label="Carregando horários">
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-2 flex-row items-center rounded-2xl border border-gray-200 px-4 py-4"
        >
          <View className="flex-1">
            <Skeleton width={90} height={15} />
            <Skeleton width={96} height={11} style={{ marginTop: 6 }} />
          </View>
          <Skeleton circle width={8} style={{ marginRight: 10 }} />
          <Skeleton width={10} height={16} radius={3} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

export function ServiceListSkeleton({ count = 3 }) {
  return (
    <SkeletonGroup label="Carregando serviços">
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3"
        >
          <Skeleton width={40} height={40} radius={12} />
          <View className="ml-3 flex-1">
            <Skeleton width={i % 2 ? "45%" : "60%"} height={15} />
            <Skeleton width="50%" height={11} style={{ marginTop: 6 }} />
          </View>
          <Skeleton width={16} height={16} radius={4} />
        </View>
      ))}
    </SkeletonGroup>
  );
}

export function AddressResultsSkeleton({ count = 4 }) {
  return (
    <SkeletonGroup label="Buscando endereços">
      {range(count).map((i) => (
        <View
          key={i}
          className="mb-2 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3"
        >
          <Skeleton width={18} height={18} radius={9} />
          <View className="ml-3 flex-1">
            <Skeleton width={i % 2 ? "55%" : "70%"} height={14} />
            <Skeleton width="45%" height={11} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}
