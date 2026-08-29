import { useBusinessStore } from "../store/businessStore";

/**
 * "OWNER" | "EMPLOYEE". Vem do /businesses/me. Enquanto não carregou, assume OWNER
 * (mais restritivo no que esconde — mas o backend é a fonte de verdade de permissão).
 */
export function useRole() {
  return useBusinessStore((s) => s.status?.role) === "EMPLOYEE" ? "EMPLOYEE" : "OWNER";
}

export function useIsOwner() {
  return useRole() === "OWNER";
}

export function useMyEmployeeId() {
  return useBusinessStore((s) => s.status?.employeeId) || null;
}
