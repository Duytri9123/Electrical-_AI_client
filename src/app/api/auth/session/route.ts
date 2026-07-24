import { authenticatedBackendFetch, clearSessionCookies, passthrough } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await authenticatedBackendFetch("/users/me");
    if (!response) {
      return NextResponse.json({
        success: false,
        message: "Chưa đăng nhập.",
      }, { status: 401 });
    }
    
    const resBody = await response.json();
    if (!response.ok) {
      return NextResponse.json(resBody, { status: response.status });
    }
    const userData = resBody.data?.user || resBody.data;
    return NextResponse.json({
      success: true,
      data: { user: userData },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối máy chủ.";
    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
