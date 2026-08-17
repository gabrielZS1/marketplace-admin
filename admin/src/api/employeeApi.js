import { apiClient } from "./client";

// Listar funcionários ativos
export async function getEmployees(businessId) {
  const response = await apiClient.get(
    `/businesses/${businessId}/employees`
  );

  return response.data;
}

// Criar funcionário
export async function createEmployee(businessId, data) {
  const response = await apiClient.post(
    `/businesses/${businessId}/employees`,
    data
  );

  return response.data;
}


// Desativar funcionário
export async function deleteEmployee(
  businessId,
  employeeId
) {
  const response = await apiClient.delete(
    `/businesses/${businessId}/employees/${employeeId}`
  );

  return response.data;
}

export async function updateEmployee(
  businessId,
  employeeId,
  data
) {
  const response = await apiClient.patch(
    `/businesses/${businessId}/employees/${employeeId}`,
    data
  );

  return response.data;
}