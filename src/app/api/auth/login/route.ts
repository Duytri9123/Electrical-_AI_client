import { backendFetch, saveSessionFromBackend } from "@/lib/server/backend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const identifier = reqBody.identifier || reqBody.email;
    const response = await backendFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier,
        email: reqBody.email,
        password: reqBody.password,
        platform: "web",
        device_name: "AIDE Web",
      }),
    });
    
    const resBody = await response.json();
    if (!response.ok) {
      return NextResponse.json(resBody, { status: response.status });
    }
    
    await saveSessionFromBackend(resBody.data);
    return NextResponse.json({
      success: true,
      message: resBody.message,
      data: { user: resBody.data.user },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi kết nối máy chủ.";
    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
