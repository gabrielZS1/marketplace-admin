import "./global.css";
import { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "./src/components/ErrorBoundary";
import IntroSplash from "./src/components/IntroSplash";
import RootNavigator from "./src/navigation/RootNavigator";
import { setupErrorHandlers } from "./src/utils/setupErrorHandlers";
import { configureGoogleSignIn } from "./src/services/googleSignIn";
import { initMonitoring } from "./src/services/monitoring";

// Relatório de falhas: só liga em produção e com EXPO_PUBLIC_SENTRY_DSN configurado.
initMonitoring();
setupErrorHandlers();
configureGoogleSignIn();

export default function App() {
  const [bootReady, setBootReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style={showIntro ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        <ErrorBoundary>
          <RootNavigator onBootReady={() => setBootReady(true)} />
        </ErrorBoundary>
        {showIntro ? (
          <IntroSplash ready={bootReady} onFinish={() => setShowIntro(false)} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}
