import { useMemo } from "react";
import { View } from "react-native";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";

const SITE_KEY = Constants.expoConfig?.extra?.turnstileSiteKey ?? "";
// Deve ser um domínio registrado no widget do Turnstile (Cloudflare).
const BASE_URL =
  Constants.expoConfig?.extra?.turnstileBaseUrl ?? "https://glowly.app";

export function isTurnstileConfigured() {
  return !!SITE_KEY;
}

const HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>html,body{margin:0;padding:0;background:transparent;display:flex;justify-content:center;align-items:center}</style>
</head><body>
<div class="cf-turnstile" data-sitekey="__SITEKEY__"
     data-callback="ok" data-error-callback="err"
     data-expired-callback="exp" data-timeout-callback="exp"></div>
<script>
function send(m){window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m));}
function ok(t){send({type:"token",token:t});}
function err(){send({type:"error"});}
function exp(){send({type:"expired"});}
</script>
</body></html>`;

/**
 * CAPTCHA invisível do Cloudflare Turnstile num WebView.
 * `onVerify(token|null)` — token quando resolve, null quando expira/falha.
 * Renderiza nada se não houver site key configurada.
 */
export default function TurnstileWidget({ onVerify }) {
  if (!SITE_KEY) return null;

  const html = useMemo(() => HTML.replace("__SITEKEY__", SITE_KEY), []);

  return (
    <View style={{ height: 70, marginTop: 12 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html, baseUrl: BASE_URL }}
        style={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
        javaScriptEnabled
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            onVerify?.(data.type === "token" ? data.token : null);
          } catch {
            onVerify?.(null);
          }
        }}
      />
    </View>
  );
}
