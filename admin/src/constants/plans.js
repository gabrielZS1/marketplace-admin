// Planos por quantidade de profissionais. O valor cobrado de verdade é calculado
// no backend (PricingService); aqui é só para exibir as opções antes de escolher.
export const TEAM_SIZES = [
  { value: 1, label: "Sou só eu", price: 10 },
  { value: 2, label: "2 profissionais", price: 20 },
  { value: 3, label: "3 profissionais", price: 30 },
  { value: 4, label: "4 profissionais", price: 40 },
  { value: 5, label: "5 ou mais", price: 50 },
];

export function formatPlanPrice(price) {
  return `R$ ${Number(price).toFixed(2).replace(".", ",")}`;
}
