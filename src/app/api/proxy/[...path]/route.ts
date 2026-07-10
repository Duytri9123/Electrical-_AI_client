import { authenticatedBackendFetch, passthrough } from "@/lib/server/backend";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  // Strip /api/proxy prefix, forward rest path to Laravel
  const apiPath = pathname.replace(/^\/api\/proxy/, "") + (searchParams.toString() ? "?" + searchParams.toString() : "");

  const contentType = request.headers.get("content-type") || "";

  // Build BodyInit — preserve raw bytes for multipart FormData
  let body: BodyInit | undefined;
  if (request.body) {
    const isFormData = contentType.includes("multipart/form-data");
    body = isFormData ? request.body : await request.blob();
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (["content-type", "content-length", "accept", "authorization"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const response = await authenticatedBackendFetch(apiPath, {
    method: request.method,
    headers,
    body,
    // @ts-ignore — duplex required for ReadableStream body
    duplex: body instanceof ReadableStream ? "half" : undefined,
  });

  if (!response) {
    return Response.json({ success: false, message: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  }

  return passthrough(response);
}
