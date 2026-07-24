import { create } from "zustand";
import { webApi, getApiMessage } from "@/lib/api";
import type { AideUser, AideRegistrationChallenge, AideApiResponse } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────
const SESSION_KEY = "aide_user_session";   // localStorage – persists across tabs/reloads
const SESSION_EXP_KEY = "aide_session_exp"; // expiry timestamp

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get cached user from localStorage.
 * Returns null if session has expired (>24h) or is corrupted.
 */
const getInitialUser = (): AideUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const exp = localStorage.getItem(SESSION_EXP_KEY);
    if (exp && Date.now() > Number(exp)) {
      // Session expired — clear
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXP_KEY);
      return null;
    }
    const cached = localStorage.getItem(SESSION_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

/**
 * Persist user to localStorage with 24-hour expiry.
 * Clears all keys when user is null (logout).
 */
const saveUserSession = (user: AideUser | null) => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_EXP_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXP_KEY);
    }
  } catch {}
};

// ─── Store ───────────────────────────────────────────────────────────────────

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

export const useAuthStore = create<AuthState>((set, get) => {
  const cachedUser = getInitialUser();
  return {
  user: cachedUser,
  // Always start as hydrated — Next.js middleware already checked cookies server-side.
  // hydrate() runs in background to refresh user data, not to gate UI rendering.
  hydrated: true,
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
      saveUserSession(user);
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
      saveUserSession(user);
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

  /**
   * Hydrate: verify the server-side session cookie is still valid.
   * Refreshes cached user data but NEVER clears local cache on network failure.
   */
  hydrate: async () => {
    const cachedUser = getInitialUser();
    // Always show cached user immediately
    if (cachedUser) {
      set({ user: cachedUser, hydrated: true });
    }

    try {
      const response = await webApi.get<AideApiResponse<{ user: AideUser }>>("/auth/session");
      const rawData = response.data.data;
      const user = (rawData as any)?.user || rawData;
      saveUserSession(user);
      set({ user, hydrated: true });
      return true;
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED" || err?.name === "AbortError") {
        set({ hydrated: true });
        return !!cachedUser;
      }
      // 401 = session truly expired — logout server & client to clear cookies
      if (err?.response?.status === 401) {
        await get().logout();
        return false;
      }
      // Other network errors — keep cached data, don't block
      set({ user: cachedUser, hydrated: true });
      return !!cachedUser;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await webApi.post("/auth/logout");
    } catch {
      // Continue logout even if server request fails
    } finally {
      saveUserSession(null);
      set({ user: null, hydrated: true, loading: false });
    }
  },
  }; // end return object
}); // end create factory
