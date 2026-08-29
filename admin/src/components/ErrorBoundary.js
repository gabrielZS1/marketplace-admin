import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";

/**
 * Captura qualquer erro de renderização na árvore abaixo e mostra uma tela
 * do próprio app em vez da tela cinza / redbox do sistema.
 */
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Em produção, mandar pro Sentry aqui.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <AlertTriangle size={26} color="#B45309" strokeWidth={2} />
          </View>

          <Text className="mt-5 text-center text-[17px] font-bold text-[#111827]">
            Algo deu errado
          </Text>
          <Text className="mt-2 text-center text-[13px] leading-5 text-gray-500">
            Tivemos um problema inesperado nesta tela. Tente de novo — se continuar,
            feche e abra o app.
          </Text>

          <TouchableOpacity
            onPress={this.handleRetry}
            activeOpacity={0.85}
            className="mt-6 h-12 items-center justify-center rounded-2xl bg-[#111827] px-8"
          >
            <Text className="text-[15px] font-semibold text-white">Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // resetKey força a remontagem da árvore ao tocar em "Tentar de novo"
    return <View key={this.state.resetKey} style={{ flex: 1 }}>{this.props.children}</View>;
  }
}
