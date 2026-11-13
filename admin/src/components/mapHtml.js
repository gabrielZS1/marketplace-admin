// Página do mapa que roda dentro do WebView (MapLibre GL + OpenFreeMap).
//
// OpenFreeMap (https://openfreemap.org) é gratuito, sem chave de API e sem cadastro,
// e funciona igual no iOS e no Android porque o mapa roda no WebView — sem módulo
// nativo e sem depender do Apple Maps / Google Maps.
//
// Atribuição exigida (OpenFreeMap + OpenMapTiles + OpenStreetMap) é mostrada pelo
// componente React Native, por isso o controle de atribuição do MapLibre fica desligado.

const MAPLIBRE_VERSION = "4.7.1";
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/bright";

export function buildMapHtml(latitude, longitude, zoom = 15) {
  // Só números entram no HTML — nada de texto vindo de fora.
  const lat = Number(latitude);
  const lon = Number(longitude);

  return `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css">
<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #f3f4f6; }
</style>
</head><body>
<div id="map"></div>
<script>
  function send(type) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(type);
  }
  try {
    var map = new maplibregl.Map({
      container: "map",
      style: "${MAP_STYLE_URL}",
      center: [${lon}, ${lat}],
      zoom: ${zoom},
      interactive: false,
      attributionControl: false,
      fadeDuration: 0
    });
    map.on("load", function () { send("loaded"); });
    map.on("error", function (e) {
      if (e && e.error && /style|Failed to fetch|NetworkError/i.test(String(e.error.message))) send("error");
    });
  } catch (e) {
    send("error");
  }
</script>
</body></html>`;
}
