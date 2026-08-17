import { apiClient } from "./client";

export const authApi = {
  async login({ email, password }) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  async registerBusinessOwner({ name, email, phone, password }) {
    const { data } = await apiClient.post("/auth/register-business-owner", {
      name,
      email,
      phone,
      password,
    });
    return data;
  },

  async getMe() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};