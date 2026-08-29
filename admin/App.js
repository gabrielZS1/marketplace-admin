import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "./src/components/ErrorBoundary";
import RootNavigator from "./src/navigation/RootNavigator";
import { setupErrorHandlers } from "./src/utils/setupErrorHandlers";
import { configureGoogleSignIn } from "./src/services/googleSignIn";

setupErrorHandlers();
configureGoogleSignIn();

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <RootNavigator />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
