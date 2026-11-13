// Cobrança da mensalidade DENTRO do app (preço, "Assinar agora", Mercado Pago no app).
//
// Desligada por padrão: nos builds das lojas (App Store / Google Play) o app mostra só o
// status da assinatura e a cobrança acontece pela página web /assinar do backend, sem
// preço nem botão de compra no app (regras de pagamento das lojas).
//
// Para testar o fluxo antigo localmente: EXPO_PUBLIC_IN_APP_BILLING=true no .env.
export const IN_APP_BILLING = process.env.EXPO_PUBLIC_IN_APP_BILLING === "true";
