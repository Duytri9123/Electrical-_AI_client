import { backendFetch } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const response = await backendFetch("/auth/resend-registration", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    
    const resBody = await response.json();
    return NextResponse.json(resBody, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối máy chủ.";
    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
