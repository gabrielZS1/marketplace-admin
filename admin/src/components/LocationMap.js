import { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { MapPin } from "lucide-react-native";
import { buildMapHtml } from "./mapHtml";

/**
 * Mapa gratuito e sem chave de API: MapLibre GL + OpenFreeMap dentro de um WebView.
 * Funciona igual no iOS e no Android (não depende de Apple Maps nem Google Maps).
 *
 * O mapa fica centralizado na coordenada, só para visualização (sem gestos), e o
 * pino é desenhado por cima, em React Native.
 */

const ZOOM = 16;

export default function LocationMap({
  latitude,
  longitude,
  height,
  showPin = true,
}) {
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  const html = useMemo(
    () => (hasCoords ? buildMapHtml(latitude, longitude, ZOOM) : null),
    [hasCoords, latitude, longitude]
  );

  return (
    <View
      style={height ? { height } : { flex: 1 }}
      className="overflow-hidden rounded-2xl bg-gray-100"
    >
      {hasCoords ? (
        <>
          {/* key: ao trocar de endereço o mapa é recriado já na nova coordenada */}
          <WebView
            key={`${latitude},${longitude}`}
            source={{ html }}
            originWhitelist={["about:*", "data:*"]}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            pointerEvents="none"
            setSupportMultipleWindows={false}
            style={{ flex: 1, backgroundColor: "#F3F4F6" }}
            onLoadStart={() => setStatus("loading")}
            onMessage={(e) => {
              const msg = e.nativeEvent.data;
              if (msg === "loaded") setStatus("ready");
              else if (msg === "error") setStatus("error");
            }}
            onError={() => setStatus("error")}
            onHttpError={() => setStatus("error")}
            // Nada de navegar pra fora do mapa (ex.: toque em algum link da página).
            onShouldStartLoadWithRequest={(req) =>
              /^(about:|data:)/i.test(req.url)
            }
          />

          {status === "loading" ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center bg-gray-100"
            >
              <ActivityIndicator color="#9CA3AF" />
            </View>
          ) : null}

          {status === "error" ? (
            <View className="absolute inset-0 items-center justify-center bg-gray-100 px-6">
              <MapPin size={26} color="#9ca3af" strokeWidth={1.5} />
              <Text className="mt-1 text-center text-xs text-gray-400">
                Não foi possível carregar o mapa. Verifique sua conexão.
              </Text>
            </View>
          ) : null}

          {showPin && status === "ready" ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center"
            >
              <View className="items-center" style={{ marginTop: -18 }}>
                <MapPin size={38} color="#111827" fill="#111827" strokeWidth={1.5} />
              </View>
            </View>
          ) : null}

          {status === "ready" ? (
            <Text className="absolute bottom-1 right-2 rounded bg-white/70 px-1 text-[9px] text-gray-600">
              © OpenFreeMap · OpenMapTiles · OpenStreetMap
            </Text>
          ) : null}
        </>
      ) : (
        <View className="flex-1 items-center justify-center">
          <MapPin size={26} color="#9ca3af" strokeWidth={1.5} />
          <Text className="mt-1 text-xs text-gray-400">Localização não definida</Text>
        </View>
      )}
    </View>
  );
}
