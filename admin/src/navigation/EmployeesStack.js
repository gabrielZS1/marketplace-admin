import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EmployeeScreen from "../screens/employees/EmployeeScreen";
import CreateEmployeeScreen from "../screens/employees/CreateEmployeeScreen";
import EditEmployeeScreen from "../screens/employees/EditEmployeeScreen";

const Stack = createNativeStackNavigator();

export default function EmployeesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Employees"
        component={EmployeeScreen}
      />

      <Stack.Screen
        name="CreateEmployee"
        component={CreateEmployeeScreen}
      />

      <Stack.Screen
        name="EditEmployee"
        component={EditEmployeeScreen}
      />
    </Stack.Navigator>
  );
}