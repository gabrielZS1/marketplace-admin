import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategoryScreen from "../screens/onboarding/CategoryScreen";
import BasicInfoScreen from "../screens/onboarding/BasicInfoScreen";
import WorkLocationScreen from "../screens/onboarding/WorkLocationScreen";
import AddressScreen from "../screens/onboarding/AddressScreen";
import AddressConfirmationScreen from "../screens/onboarding/AddressConfirmationScreen";
import LocationConfirmationScreen from "../screens/onboarding/LocationConfirmationScreen";
import TeamSizeScreen from "../screens/onboarding/TeamSizeScreen";
import WorkingHoursScreen from "../screens/onboarding/WorkingHoursScreen";
import ServicesScreen from "../screens/onboarding/ServicesScreen";
import CompleteScreen from "../screens/onboarding/CompleteScreen";
import AddressSearchScreen from "../screens/onboarding/AddressSearchScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
      <Stack.Screen name="WorkLocation" component={WorkLocationScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="AddressConfirmation" component={AddressConfirmationScreen} />
      <Stack.Screen name="LocationConfirmation" component={LocationConfirmationScreen} />
      <Stack.Screen name="TeamSize" component={TeamSizeScreen} />
      <Stack.Screen name="WorkingHours" component={WorkingHoursScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
      <Stack.Screen name="AddressSearch" component={AddressSearchScreen} />
      {/* Próximas telas entram aqui conforme construímos */}
    </Stack.Navigator>
  );
}