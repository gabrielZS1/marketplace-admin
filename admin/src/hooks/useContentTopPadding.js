import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBusinessStore } from "../store/businessStore";

/**
 * Padding do topo pro conteúdo das telas com abas.
 * Quando o SubscriptionBanner está visível, ele já ocupa a área do status bar,
 * então o conteúdo não precisa reservar o inset de novo.
 */
export function useContentTopPadding(extra = 14) {
  const insets = useSafeAreaInsets();
  const status = useBusinessStore((s) => s.status);

  const bannerVisible =
    !!status &&
    status.active !== false &&
    (status.subscriptionStatus === "TRIAL" ||
      status.subscriptionStatus === "PAST_DUE");

  return (bannerVisible ? 6 : insets.top) + extra;
}
