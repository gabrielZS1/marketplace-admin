import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AgendaScreen from "../screens/agenda/AgendaScreen";
import CreateTimeBlockScreen from "../screens/agenda/CreateTimeBlockScreen";
import CreateDayOffScreen from "../screens/agenda/CreateDayOffScreen";

const Stack = createNativeStackNavigator();

export default function AgendaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaHome" component={AgendaScreen} />
      <Stack.Screen name="CreateTimeBlock" component={CreateTimeBlockScreen} />
      <Stack.Screen name="CreateDayOff" component={CreateDayOffScreen} />
    </Stack.Navigator>
  );
}
