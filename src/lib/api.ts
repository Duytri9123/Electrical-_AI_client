import axios from "axios";

export type AideApiFieldError = { field: string; message: string };

export const webApi = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

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
