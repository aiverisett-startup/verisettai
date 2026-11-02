import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });

    const serializedAgents = agents.map((a) => ({
      ...a,
      totalSettled: a.totalSettled ? a.totalSettled.toString() : "0",
    }));

    return NextResponse.json(
      {
        agents: serializedAgents,
        totalCount: serializedAgents.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[AGENTS_GET_ERROR]:", err);
    return NextResponse.json(
      {
        agents: [],
        totalCount: 0,
        error: err?.message || "Failed to fetch agents",
      },
      {
        status: 200, // Safe database fallback without crashing UI
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, endpoint, protocol, userId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Agent name is required" },
        { status: 400 }
      );
    }

    const createdAgent = await prisma.agent.create({
      data: {
        name: name.trim(),
        endpoint: endpoint ? String(endpoint).trim() : null,
        protocol: protocol || "A2A",
        userId: userId || null,
        status: "ACTIVE",
        throughputTps: 0.0,
        totalSettled: BigInt(0),
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        agent: {
          ...createdAgent,
          totalSettled: createdAgent.totalSettled.toString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[AGENTS_POST_ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create agent" },
      { status: 500 }
    );
  }
}
