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
    if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return await fetch(`${apiBase}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(12000),
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
  
  cookieStore.set(accessCookie, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    priority: "high",
    maxAge: Math.max(60, session.expires_in),
  });

  const refreshMaxAge = Math.max(60, Math.floor((new Date(session.refresh_expires_at).getTime() - Date.now()) / 1000));
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
    await clearSessionCookies();
    return null;
  }

  const payload = await response.json();
  await storeSession(payload.data);
  return payload.data.access_token;
}

export async function authenticatedBackendFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(accessCookie)?.value;

  if (!accessToken) {
    accessToken = await rotateSession() ?? undefined;
  }
  if (!accessToken) return null;

  let response = await backendFetch(path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    accessToken = await rotateSession() ?? undefined;
    if (!accessToken) return response;
    response = await backendFetch(path, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
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
