import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import AuthStack from "./AuthStack";
import OnboardingStack from "./OnboardingStack";
import AdminTabs from "./AdminTabs";
import TrialExpiredScreen from "../screens/subscription/TrialExpiredScreen";
import SubscriptionBanner from "../components/SubscriptionBanner";
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

export default function RootNavigator() {
  const [isRestoring, setIsRestoring] = useState(true);

  const token = useAuthStore((state) => state.token);
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

    if (!businessStatus || !businessStatus.onboardingCompleted) {
      return <OnboardingStack />;
    }

    if (isBlocked(businessStatus)) {
      return <TrialExpiredScreen status={businessStatus} />;
    }

    return (
      <View className="flex-1">
        <SubscriptionBanner />
        <AdminTabs />
      </View>
    );
  }

  return <NavigationContainer>{renderContent()}</NavigationContainer>;
}
