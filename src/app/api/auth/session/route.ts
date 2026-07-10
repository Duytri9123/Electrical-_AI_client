import { authenticatedBackendFetch, clearSessionCookies, passthrough } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await authenticatedBackendFetch("/users/me");
    if (!response) {
      return NextResponse.json({
        success: false,
        message: "Chưa đăng nhập.",
      }, { status: 401 });
    }
    
    if (!response.ok) {
      await clearSessionCookies();
    }
    
    return passthrough(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối máy chủ.";
    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
