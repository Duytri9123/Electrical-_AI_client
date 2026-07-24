import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiBase = (process.env.AIDE_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
const accessCookie = "aide_access_token";
const refreshCookie = "aide_refresh_token";

type SessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_at: string;
  user: unknown;
};

export async function backendFetch(path: string, init?: RequestInit) {
  try {
    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");
    headers.set("Connection", "close");
    if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return await fetch(`${apiBase}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(15000),
    });
  } catch (err) {
    console.error("Backend fetch error:", err);
    return Response.json({
      success: false,
      code: "BACKEND_UNAVAILABLE",
      message: "Không thể kết nối máy chủ Laravel. Vui lòng thử lại sau.",
    }, { status: 503 });
  }
}

async function storeSession(session: SessionPayload) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  
  const accessMaxAge = 24 * 3600; // 24 hours (1 full day inactivity limit)
  const refreshMaxAge = 90 * 24 * 3600; // 90 days

  cookieStore.set(accessCookie, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    priority: "high",
    maxAge: accessMaxAge,
  });

  cookieStore.set(refreshCookie, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    priority: "high",
    maxAge: refreshMaxAge,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessCookie);
  cookieStore.delete(refreshCookie);
}

export async function saveSessionFromBackend(session: SessionPayload) {
  await storeSession(session);
}

async function rotateSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(refreshCookie)?.value;
  if (!refreshToken) return null;

  const response = await backendFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (payload.data) {
    await storeSession(payload.data);
    return payload.data.access_token;
  }
  return null;
}

export async function authenticatedBackendFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(accessCookie)?.value;

  if (!accessToken) {
    accessToken = await rotateSession() ?? undefined;
  }

  const headers: Record<string, string> = {};
  if (init?.headers) {
    const initHeaders = new Headers(init.headers);
    initHeaders.forEach((v, k) => {
      headers[k] = v;
    });
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await backendFetch(path, {
    ...init,
    headers,
  });

  if (response.status === 401 && accessToken) {
    accessToken = await rotateSession() ?? undefined;
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await backendFetch(path, {
        ...init,
        headers,
      });
    }
  }

  return response;
}

export async function passthrough(response: Response) {
  const body = await response.json().catch(() => ({
    success: false,
    message: "Phản hồi từ máy chủ không hợp lệ.",
  }));
  return NextResponse.json(body, { status: response.status });
}

export async function sessionTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(accessCookie)?.value,
    refreshToken: cookieStore.get(refreshCookie)?.value,
  };
}
