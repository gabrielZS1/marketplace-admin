import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Calendar,
  Users,
  UserRoundCheck,
  Store,
  LayoutDashboard,
} from "lucide-react-native";
import { View, Text } from "react-native";

import AgendaStack from "./AgendaStack";
import ProfileStack from "./ProfileStack";
import EmployeesStack from "./EmployeesStack";

import ClientsScreen from "../screens/clients/ClientsScreen";
import OverviewScreen from "../screens/overview/OverviewScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 9,
        },
        tabBarStyle: {
          backgroundColor: "#000",
          height: 70,
          paddingBottom: 12,
        },
      }}
    >
      {/* AGENDA */}
      <Tab.Screen
        name="Agendamento"
        component={AgendaStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* CLIENTES */}
      <Tab.Screen
        name="Clientes"
        component={ClientsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserRoundCheck
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* VISÃO GERAL */}
      <Tab.Screen
        name="VisaoGeral"
        component={OverviewScreen}
        options={{
          tabBarLabel: "Visão Geral",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* FUNCIONÁRIOS */}
      <Tab.Screen
        name="Funcionarios"
        component={EmployeesStack}
        options={{
          tabBarLabel: "Equipe",
          tabBarIcon: ({ color, size }) => (
            <Users
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* PERFIL */}
      <Tab.Screen
        name="Perfil"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Store
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}