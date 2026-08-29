import { apiClient } from "./client";

export const authApi = {
  async login({ email, password }) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  async registerBusinessOwner({ name, email, phone, password, acceptedTerms, captchaToken }) {
    const { data } = await apiClient.post("/auth/register-business-owner", {
      name,
      email,
      phone,
      password,
      acceptedTerms,
      captchaToken,
    });
    return data;
  },

  async loginWithGoogle({ idToken }) {
    const { data } = await apiClient.post("/auth/google", {
      idToken,
      role: "BUSINESS_OWNER",
    });
    return data;
  },

  async getMe() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  async changePassword({ currentPassword, newPassword }) {
    await apiClient.patch("/auth/password", { currentPassword, newPassword });
  },

  async forgotPassword({ email }) {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword({ email, code, newPassword }) {
    await apiClient.post("/auth/reset-password", { email, code, newPassword });
  },

  async verifyEmail({ code }) {
    await apiClient.post("/auth/verify-email", { code });
  },

  async deleteAccount({ password } = {}) {
    await apiClient.post("/auth/delete-account", { password });
  },

  async resendVerification() {
    await apiClient.post("/auth/resend-verification");
  },
};