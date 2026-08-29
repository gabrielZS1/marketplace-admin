import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import BusinessDetailsScreen from "../screens/profile/BusinessDetailsScreen";
import ManageServicesScreen from "../screens/settings/ManageServicesScreen";
import ManageHoursScreen from "../screens/settings/ManageHoursScreen";
import BillingScreen from "../screens/settings/BillingScreen";
import NotificationSettingsScreen from "../screens/settings/NotificationSettingsScreen";
import GiftCardsScreen from "../screens/settings/GiftCardsScreen";
import ChangePasswordScreen from "../screens/settings/ChangePasswordScreen";
import StatsScreen from "../screens/stats/StatsScreen";
import IntervalScreen from "../screens/settings/IntervalScreen";
import DeleteAccountScreen from "../screens/settings/DeleteAccountScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
      <Stack.Screen name="ManageHours" component={ManageHoursScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="GiftCards" component={GiftCardsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen name="Interval" component={IntervalScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}
