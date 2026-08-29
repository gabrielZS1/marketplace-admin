const MAX_DIGITS = 11;

/**
 * Formata um telefone brasileiro conforme digita: "(11) 99999-9999" / "(11) 3333-4444".
 * Aceita qualquer entrada (limpa não-dígitos) e é idempotente.
 */
export function formatPhone(value) {
  const d = String(value || "").replace(/\D/g, "").slice(0, MAX_DIGITS);

  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Só os dígitos de um telefone. */
export function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** true quando tem DDD + número (10 ou 11 dígitos). */
export function isValidPhone(value) {
  const n = phoneDigits(value).length;
  return n === 10 || n === 11;
}

/**
 * Normaliza um @ de rede social: um único "@" na frente, sem espaços,
 * no máximo `max` caracteres no total (incluindo o "@"). Vazio continua vazio.
 */
export function formatHandle(value, max = 40) {
  const clean = String(value || "")
    .replace(/\s/g, "")
    .replace(/@/g, "")
    .slice(0, max - 1);
  return clean ? `@${clean}` : "";
}
