import { createNavigationContainerRef } from "@react-navigation/native";

// Permite navegar de fora das telas (ex.: ao tocar numa notificação push).
export const navigationRef = createNavigationContainerRef();
