import axios from "axios";

export type AideApiFieldError = { field: string; message: string };

export const webApi = axios.create({
  baseURL: "/api",
  timeout: 90000,
  withCredentials: true, // Always send cookies (required for httpOnly session cookies)
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Add a unique request fingerprint header for basic CSRF mitigation on all calls
webApi.interceptors.request.use(
  (config) => {
    // Anti-CSRF: mark requests as coming from our SPA
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401 response: clear cached session data from storage without hard reloading
// On 503/504: return graceful fallback response to avoid uncaught dev error overlay
webApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
      // Quietly ignore aborted/canceled requests (no dev overlay error)
      return Promise.resolve({ data: { success: false, data: null } });
    }
    if (axios.isAxiosError(error) && (error.response?.status === 503 || error.response?.status === 504)) {
      console.warn("Backend API service is unavailable (503/504). Returning fallback response.");
      return Promise.resolve({
        data: {
          success: false,
          message: "Dịch vụ máy chủ tạm thời không khả dụng (503/504). Vui lòng thử lại sau.",
          data: null,
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config || {},
      });
    }
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        localStorage.removeItem("aide_user_session");
        localStorage.removeItem("aide_session_exp");
      } catch {}
    }
    return Promise.reject(error);
  }
);

export function getApiMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  if (!error.response) return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  return (error.response.data as { message?: string })?.message ?? "Máy chủ đang bận. Vui lòng thử lại.";
}

export function getApiFieldErrors(error: unknown): AideApiFieldError[] {
  if (!axios.isAxiosError(error)) return [];
  const errors = (error.response?.data as { errors?: unknown })?.errors;
  if (!Array.isArray(errors)) return [];

  return errors.filter((entry): entry is AideApiFieldError =>
    typeof entry === "object" && entry !== null &&
    typeof (entry as AideApiFieldError).field === "string" &&
    typeof (entry as AideApiFieldError).message === "string"
  );
}
