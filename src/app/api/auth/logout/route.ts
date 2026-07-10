import { authenticatedBackendFetch, clearSessionCookies, sessionTokens } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export async function POST() {
  const { refreshToken } = await sessionTokens();
  try {
    if (refreshToken) {
      await authenticatedBackendFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (err) {
    console.error("Backend logout error:", err);
  } finally {
    await clearSessionCookies();
  }
  
  return NextResponse.json({
    success: true,
    message: "Đăng xuất thành công.",
    data: null,
  });
}
