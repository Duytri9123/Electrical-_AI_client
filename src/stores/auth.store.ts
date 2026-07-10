import { create } from "zustand";
import { webApi, getApiMessage } from "@/lib/api";
import type { AideUser, AideRegistrationChallenge, AideApiResponse } from "@/types";

interface AuthState {
  user: AideUser | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AideUser>;
  register: (values: { full_name: string; email: string; phone?: string; password: string }) => Promise<AideRegistrationChallenge>;
  verifyOtp: (challengeToken: string, code: string) => Promise<AideUser>;
  resendOtp: (challengeToken: string) => Promise<{ email_hint: string; expires_in: number }>;
  hydrate: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await webApi.post<AideApiResponse<{ user: AideUser }>>("/auth/login", {
        identifier: email,
        password,
      });
      const user = response.data.data.user;
      set({ user, hydrated: true, loading: false });
      return user;
    } catch (err) {
      const message = getApiMessage(err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  register: async (values) => {
    set({ loading: true, error: null });
    try {
      const response = await webApi.post<AideApiResponse<AideRegistrationChallenge>>("/auth/register", values);
      set({ loading: false });
      return response.data.data;
    } catch (err) {
      const message = getApiMessage(err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  verifyOtp: async (challengeToken, code) => {
    set({ loading: true, error: null });
    try {
      const response = await webApi.post<AideApiResponse<{ user: AideUser }>>("/auth/verify-registration", {
        challenge_token: challengeToken,
        code,
      });
      const user = response.data.data.user;
      set({ user, hydrated: true, loading: false });
      return user;
    } catch (err) {
      const message = getApiMessage(err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  resendOtp: async (challengeToken) => {
    set({ loading: true, error: null });
    try {
      const response = await webApi.post<AideApiResponse<{ email_hint: string; expires_in: number }>>("/auth/resend", {
        challenge_token: challengeToken,
      });
      set({ loading: false });
      return response.data.data;
    } catch (err) {
      const message = getApiMessage(err);
      set({ error: message, loading: false });
      throw err;
    }
  },

  hydrate: async () => {
    try {
      const response = await webApi.get<AideApiResponse<{ user: AideUser }>>("/auth/session");
      const user = response.data.data.user;
      set({ user, hydrated: true });
      return true;
    } catch {
      set({ user: null, hydrated: true });
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await webApi.post("/auth/logout");
    } finally {
      set({ user: null, hydrated: true, loading: false });
    }
  },
}));
