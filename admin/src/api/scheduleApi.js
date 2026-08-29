import { apiClient } from "./client";

// Monta um ISO com o fuso de Brasília (-03:00). date "YYYY-MM-DD", time "HH:mm".
export function toIso(date, time) {
  return `${date}T${time}:00-03:00`;
}

export const scheduleApi = {
  // ---- Bloqueios (estabelecimento) ----
  async listTimeBlocks(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/time-blocks`);
    return data;
  },
  async createTimeBlock(businessId, { startsAt, endsAt, reason }) {
    const { data } = await apiClient.post(`/businesses/${businessId}/time-blocks`, {
      startsAt,
      endsAt,
      reason: reason || null,
    });
    return data;
  },
  async deleteTimeBlock(businessId, id) {
    await apiClient.delete(`/businesses/${businessId}/time-blocks/${id}`);
  },

  // ---- Intervalo recorrente (estabelecimento, todo dia) ----
  async listIntervals(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/intervals`);
    return data;
  },
  async createInterval(businessId, { startTime, endTime, label }) {
    const { data } = await apiClient.post(`/businesses/${businessId}/intervals`, {
      startTime,
      endTime,
      label: label || null,
    });
    return data;
  },
  async deleteInterval(businessId, id) {
    await apiClient.delete(`/businesses/${businessId}/intervals/${id}`);
  },

  // ---- Folgas (profissional) ----
  async listTimeOffs(businessId) {
    const { data } = await apiClient.get(`/businesses/${businessId}/time-offs`);
    return data;
  },
  async createTimeOff(businessId, { employeeId, startsAt, endsAt, allDay, reason }) {
    const { data } = await apiClient.post(`/businesses/${businessId}/time-offs`, {
      employeeId,
      startsAt,
      endsAt,
      allDay: !!allDay,
      reason: reason || null,
    });
    return data;
  },
  async deleteTimeOff(businessId, id) {
    await apiClient.delete(`/businesses/${businessId}/time-offs/${id}`);
  },
};
