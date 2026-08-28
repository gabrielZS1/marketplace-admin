import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Plus, X } from "lucide-react-native";

import { useImagePicker } from "../../hooks/useImagePicker";
import { businessApi } from "../../api/businessApi";

/**
 * Galeria gerenciável de fotos de uma categoria ("PORTFOLIO" | "WORKSPACE").
 * Cuida do próprio carregamento, upload e remoção.
 */
export default function PhotoManager({ businessId, category, title, hint }) {
  const { pickImage } = useImagePicker();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    if (!businessId) return;
    businessApi
      .listPhotos(businessId)
      .then((all) => setPhotos(all.filter((p) => p.category === category)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessId, category]);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    const uri = await pickImage();
    if (!uri) return;
    setUploading(true);
    try {
      await businessApi.uploadPhoto(businessId, uri, category);
      load();
    } catch (err) {
      Alert.alert("Erro", err.message || "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  function remove(photo) {
    Alert.alert("Remover foto", "Tem certeza que quer remover esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await businessApi.deletePhoto(businessId, photo.id);
            setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
          } catch (err) {
            Alert.alert("Erro", err.message || "Não foi possível remover.");
          }
        },
      },
    ]);
  }

  return (
    <View className="mt-6">
      <Text className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </Text>
      {hint ? <Text className="mt-0.5 text-[12px] text-gray-400">{hint}</Text> : null}

      {loading ? (
        <ActivityIndicator className="mt-3 self-start" color="#111827" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 8 }}
        >
          {photos.map((photo) => (
            <View key={photo.id}>
              <Image
                source={{ uri: photo.url }}
                className="h-24 w-24 rounded-2xl bg-gray-100"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => remove(photo)}
                className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/70"
              >
                <X size={13} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={add}
            disabled={uploading}
            className="h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-gray-300"
          >
            {uploading ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <>
                <Plus size={20} color="#111827" strokeWidth={2.2} />
                <Text className="mt-1 text-[10px] font-medium text-gray-500">Adicionar</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
