import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import AuthStack from "./AuthStack";
import OnboardingStack from "./OnboardingStack";
import AdminTabs from "./AdminTabs";
import TrialExpiredScreen from "../screens/subscription/TrialExpiredScreen";
import SubscriptionBanner from "../components/SubscriptionBanner";
import ErrorBoundary from "../components/ErrorBoundary";
import { useAuthStore } from "../store/authStore";
import { useBusinessStore } from "../store/businessStore";

function isBlocked(status) {
  if (!status) return false;
  if (status.active === false) return true;
  return (
    status.subscriptionStatus === "EXPIRED" ||
    status.subscriptionStatus === "SUSPENDED"
  );
}

function AppShell() {
  return (
    <View className="flex-1">
      <SubscriptionBanner />
      <AdminTabs />
    </View>
  );
}

export default function RootNavigator() {
  const [isRestoring, setIsRestoring] = useState(true);

  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);
  const logout = useAuthStore((state) => state.logout);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  const businessStatus = useBusinessStore((state) => state.status);
  const isCheckingBusiness = useBusinessStore((state) => state.isLoading);
  const fetchBusinessStatus = useBusinessStore((state) => state.fetchStatus);

  useEffect(() => {
    restoreSession().finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    if (token) fetchBusinessStatus();
  }, [token]);

  if (isRestoring || (token && isCheckingBusiness && !businessStatus)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  function renderContent() {
    if (!token) return <AuthStack />;

    const isEmployee = role === "EMPLOYEE" || businessStatus?.role === "EMPLOYEE";

    if (isEmployee) {
      if (!businessStatus) {
        return (
          <View className="flex-1 items-center justify-center bg-white px-8">
            <Text className="text-center text-[15px] font-semibold text-[#111827]">
              Sua conta não está vinculada a nenhum estabelecimento
            </Text>
            <Text className="mt-2 text-center text-[13px] text-gray-500">
              Peça pro responsável te adicionar de novo.
            </Text>
            <TouchableOpacity
              onPress={logout}
              className="mt-6 rounded-2xl bg-[#111827] px-6 py-3"
            >
              <Text className="text-[14px] font-semibold text-white">Sair</Text>
            </TouchableOpacity>
          </View>
        );
      }
      if (isBlocked(businessStatus)) {
        return <TrialExpiredScreen status={businessStatus} />;
      }
      return <AppShell />;
    }

    // Dono
    if (!businessStatus || !businessStatus.onboardingCompleted) {
      return <OnboardingStack />;
    }
    if (isBlocked(businessStatus)) {
      return <TrialExpiredScreen status={businessStatus} />;
    }
    return <AppShell />;
  }

  return (
    <NavigationContainer>
      <ErrorBoundary>{renderContent()}</ErrorBoundary>
    </NavigationContainer>
  );
}
