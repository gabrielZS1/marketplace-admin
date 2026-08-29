import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Coffee, Trash2, Plus } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import Button from "../../components/ui/Button";
import TimeStepper, { timeToMinutes } from "../../components/ui/TimeStepper";
import ErrorState from "../../components/ui/ErrorState";
import { useBusinessStore } from "../../store/businessStore";
import { scheduleApi } from "../../api/scheduleApi";

// "12:00:00" -> "12:00"
function hhmm(t) {
  return String(t || "").slice(0, 5);
}

export default function IntervalScreen({ navigation }) {
  const businessId = useBusinessStore((s) => s.status?.id);

  const [intervals, setIntervals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await scheduleApi.listIntervals(businessId);
      setIntervals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Erro ao carregar intervalos:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const formValid = timeToMinutes(end) > timeToMinutes(start);

  async function handleAdd() {
    if (!formValid || saving || !businessId) return;
    setFormError(null);
    setSaving(true);
    try {
      await scheduleApi.createInterval(businessId, {
        startTime: start,
        endTime: end,
        label: label.trim(),
      });
      setAdding(false);
      setLabel("");
      setStart("12:00");
      setEnd("13:00");
      load();
    } catch (err) {
      setFormError(err.message || "Não foi possível salvar o intervalo.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(item) {
    Alert.alert(
      "Remover intervalo",
      `${hhmm(item.startTime)}–${hhmm(item.endTime)} volta a ficar disponível para agendamento.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await scheduleApi.deleteInterval(businessId, item.id);
              setIntervals((prev) => prev.filter((i) => i.id !== item.id));
            } catch (err) {
              Alert.alert("Erro", err.message || "Não foi possível remover.");
            }
          },
        },
      ],
    );
  }

  return (
    <Screen navigation={navigation} title="Intervalo">
      <Text className="mb-5 text-[13px] leading-5 text-gray-500">
        Faixas de horário que se repetem todos os dias em que você atende — como o
        almoço. Ninguém consegue agendar dentro delas.
      </Text>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <ErrorState message="Não foi possível carregar os intervalos" onRetry={load} />
      ) : (
        <>
          {intervals.length === 0 && !adding ? (
            <View className="items-center rounded-2xl border border-dashed border-gray-300 px-6 py-10">
              <Coffee size={30} color="#9CA3AF" />
              <Text className="mt-3 text-center text-[13px] text-gray-500">
                Nenhum intervalo cadastrado.
              </Text>
            </View>
          ) : null}

          {intervals.map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center rounded-2xl border border-gray-100 bg-white px-4 py-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <Coffee size={16} color="#374151" strokeWidth={2} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-[#111827]">
                  {hhmm(item.startTime)} – {hhmm(item.endTime)}
                </Text>
                {item.label ? (
                  <Text className="mt-0.5 text-[12px] text-gray-400">{item.label}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color="#DC2626" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}

          {adding ? (
            <View className="mt-3 rounded-2xl border border-gray-200 p-4">
              <View className="flex-row" style={{ gap: 12 }}>
                <TimeStepper label="Início" value={start} onChange={setStart} />
                <TimeStepper label="Fim" value={end} onChange={setEnd} />
              </View>

              {!formValid ? (
                <Text className="mt-3 text-[12px] text-red-600">
                  O fim precisa ser depois do início.
                </Text>
              ) : null}

              <View className="mt-4">
                <View className="absolute left-3 top-[-8px] z-10 bg-white px-1.5">
                  <Text className="text-[11px] font-medium text-gray-400">
                    Nome (opcional)
                  </Text>
                </View>
                <TextInput
                  value={label}
                  onChangeText={(v) => setLabel(v.slice(0, 60))}
                  placeholder="Ex.: Almoço"
                  placeholderTextColor="#9CA3AF"
                  className="h-14 rounded-2xl border border-gray-200 px-4 text-[15px] text-[#111827]"
                />
              </View>

              {formError ? (
                <Text className="mt-3 text-[13px] text-red-600">{formError}</Text>
              ) : null}

              <View className="mt-4 flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => {
                      setAdding(false);
                      setFormError(null);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Adicionar"
                    onPress={handleAdd}
                    loading={saving}
                    disabled={!formValid}
                  />
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setAdding(true)}
              activeOpacity={0.8}
              className="mt-3 flex-row items-center justify-center rounded-2xl border border-dashed border-gray-300 py-4"
            >
              <Plus size={18} color="#111827" strokeWidth={2.2} />
              <Text className="ml-2 text-[13px] font-semibold text-[#111827]">
                Adicionar intervalo
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </Screen>
  );
}
