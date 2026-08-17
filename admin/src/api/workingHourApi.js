import { apiClient } from "./client";


// Salvar/substituir todos os horários do funcionário
export async function updateEmployeeWorkingHours(
  employeeId,
  workingHours
) {
  const response = await apiClient.put(
    `/employees/${employeeId}/working-hours`,
    {
      workingHours,
    }
  );

  return response.data;
}

export async function getEmployeeWorkingHours(employeeId) {
  const response = await apiClient.get(
    `/employees/${employeeId}/working-hours`
  );

  return response.data;
}