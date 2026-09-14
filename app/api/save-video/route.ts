import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 1. Production Security Guard: Disable unauthenticated file write endpoint in production
    const isProduction = process.env.NODE_ENV === "production";
    const devSecret = process.env.INTERNAL_DEV_SECRET;
    const authHeader = req.headers.get("x-internal-dev-secret");

    if (isProduction && (!devSecret || authHeader !== devSecret)) {
      return NextResponse.json(
        { error: "Forbidden: Internal utility endpoint disabled in production." },
        { status: 403 }
      );
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. DoS Protection: Limit payload size to max 25MB
    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty video payload" }, { status: 400 });
    }
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "Payload exceeds maximum 25MB size limit." }, { status: 413 });
    }

    // 3. Save safely to public directory
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const publicVideoPath = path.join(publicDir, "how-it-works.webm");
    fs.writeFileSync(publicVideoPath, buffer);

    return NextResponse.json({
      success: true,
      sizeBytes: buffer.length,
      publicPath: "/how-it-works.webm",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
