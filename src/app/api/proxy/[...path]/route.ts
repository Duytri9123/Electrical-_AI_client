import { authenticatedBackendFetch, passthrough } from "@/lib/server/backend";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
// Increase body size limit to 50MB for file uploads
export const maxDuration = 90;

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
  const apiPath =
    pathname.replace(/^\/api\/proxy/, "") +
    (searchParams.toString() ? "?" + searchParams.toString() : "");

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  // Build headers to forward
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lkey = key.toLowerCase();
    if (["accept", "authorization"].includes(lkey)) {
      headers[key] = value;
    }
    // Forward content-type only for non-multipart (for multipart, fetch sets it automatically with boundary)
    if (lkey === "content-type" && !isMultipart) {
      headers[key] = value;
    }
  });

  // Build body
  let body: BodyInit | undefined;
  if (request.body) {
    if (isMultipart) {
      // For multipart uploads: read the raw bytes as ArrayBuffer then send as-is
      // This avoids ReadableStream duplex issues and preserves the boundary
      try {
        const arrayBuffer = await request.arrayBuffer();
        body = arrayBuffer;
        // Must forward the original content-type WITH boundary for multipart
        headers["content-type"] = contentType;
        headers["content-length"] = String(arrayBuffer.byteLength);
      } catch (err) {
        console.error("Failed to read multipart body:", err);
        return Response.json(
          { success: false, message: "Đọc file upload thất bại." },
          { status: 400 }
        );
      }
    } else {
      body = await request.blob();
    }
  }

  // Analyze & upload need longer timeouts (AI processing), everything else 15s
  const isLongRunning = apiPath.includes("/analyze") || isMultipart;
  const timeoutMs = isLongRunning ? 90000 : 15000;

  const response = await authenticatedBackendFetch(apiPath, {
    method: request.method,
    headers,
    body,
    signal: AbortSignal.timeout(timeoutMs),
  } as RequestInit);

  if (!response) {
    return Response.json(
      { success: false, message: "Phiên đăng nhập đã hết hạn." },
      { status: 401 }
    );
  }

  return passthrough(response);
}
