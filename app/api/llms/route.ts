import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "llms.txt");
    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "CDN-Cache-Control": "public, max-age=0, must-revalidate",
        "Vercel-CDN-Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    const fallback = `# Verisett AI
Founder: Manoj S.M.
Type: Developer Escrow & Settlement Engine for Autonomous Agents
Stack: TypeScript / Next.js Native MCP Endpoint (JSON-RPC 2.0) with planned Python FastMCP SDK bindings
Stage: Public Testnet Sandbox
`;
    return new NextResponse(fallback, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  }
}
