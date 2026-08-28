import { useState } from "react";
import { Image, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";

/**
 * Mapa real, sem dependência nativa: monta os tiles num grid e centraliza
 * exatamente na coordenada, com um pino por cima.
 *
 * Usa os basemaps públicos do CARTO (sem chave, estilo claro que combina com
 * o app). O tile server do OSM (tile.openstreetmap.org) bloqueia apps com 403,
 * por isso não é usado aqui.
 *
 * Para produção com volume alto, migrar pra `react-native-maps` ou um provedor
 * com chave (MapTiler / Geoapify).
 */

const TILE = 256;
const ZOOM = 15;
const SUBDOMAINS = ["a", "b", "c", "d"];

const tileUrl = (z, x, y) => {
  const s = SUBDOMAINS[Math.abs(x + y) % SUBDOMAINS.length];
  return `https://${s}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}@2x.png`;
};

function lonToTileX(lon, z) {
  return ((lon + 180) / 360) * Math.pow(2, z);
}

function latToTileY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    Math.pow(2, z)
  );
}

export default function LocationMap({
  latitude,
  longitude,
  height,
  showPin = true,
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const hasCoords =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  return (
    <View
      onLayout={(e) =>
        setSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
      style={height ? { height } : { flex: 1 }}
      className="overflow-hidden rounded-2xl bg-gray-100"
    >
      {hasCoords && size.width > 0 ? (
        <MapTiles
          latitude={latitude}
          longitude={longitude}
          width={size.width}
          height={size.height}
        />
      ) : null}

      {showPin && hasCoords ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="items-center" style={{ marginTop: -18 }}>
            <MapPin size={38} color="#111827" fill="#111827" strokeWidth={1.5} />
          </View>
        </View>
      ) : null}

      {hasCoords ? (
        <Text className="absolute bottom-1 right-2 text-[9px] text-gray-500">
          © OpenStreetMap · CARTO
        </Text>
      ) : (
        <View className="flex-1 items-center justify-center">
          <MapPin size={26} color="#9ca3af" strokeWidth={1.5} />
          <Text className="mt-1 text-xs text-gray-400">Localização não definida</Text>
        </View>
      )}
    </View>
  );
}

function MapTiles({ latitude, longitude, width, height }) {
  const maxTile = Math.pow(2, ZOOM) - 1;

  const centerX = lonToTileX(longitude, ZOOM);
  const centerY = latToTileY(latitude, ZOOM);

  const baseX = Math.floor(centerX);
  const baseY = Math.floor(centerY);

  // tiles suficientes pra cobrir o container em qualquer tamanho
  const spanX = Math.ceil(width / TILE / 2) + 1;
  const spanY = Math.ceil(height / TILE / 2) + 1;

  const tiles = [];
  for (let i = -spanX; i <= spanX; i++) {
    for (let j = -spanY; j <= spanY; j++) {
      const tx = baseX + i;
      const ty = baseY + j;
      if (tx < 0 || ty < 0 || tx > maxTile || ty > maxTile) continue;

      const left = width / 2 + (tx - centerX) * TILE;
      const top = height / 2 + (ty - centerY) * TILE;

      tiles.push(
        <Image
          key={`${tx}-${ty}`}
          source={{ uri: tileUrl(ZOOM, tx, ty) }}
          style={{ position: "absolute", left, top, width: TILE, height: TILE }}
        />
      );
    }
  }

  return <View className="absolute inset-0">{tiles}</View>;
}
