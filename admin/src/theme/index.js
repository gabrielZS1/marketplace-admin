// Tokens visuais do app. Mantém tudo consistente entre as telas.
export const colors = {
  ink: "#111827", // preto-grafite (cor principal / textos fortes)
  inkSoft: "#374151", // texto secundário
  muted: "#9CA3AF", // texto auxiliar / placeholders
  line: "#E5E7EB", // bordas e divisórias
  surface: "#F9FAFB", // fundo de cards / campos
  bg: "#FFFFFF",
  danger: "#DC2626",
  success: "#16A34A",
};

// Passos do onboarding (usado pelo Stepper e por cada tela).
export const ONBOARDING_STEPS = [
  "Category",
  "BasicInfo",
  "WorkLocation",
  "Address",
  "AddressConfirmation",
  "LocationConfirmation",
  "TeamSize",
  "WorkingHours",
  "Services",
  "Complete",
];

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;

export function stepIndex(routeName) {
  const i = ONBOARDING_STEPS.indexOf(routeName);
  return i === -1 ? 0 : i + 1;
}
