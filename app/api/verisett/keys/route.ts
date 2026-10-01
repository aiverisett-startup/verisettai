import { NextRequest, NextResponse } from "next/server";
import {
  listApiKeys,
  createAgentApiKey,
  revokeApiKey,
  getAgentAccount,
  verifyApiKeyConstantTime,
} from "@/lib/verisettDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
    const requestedKey = searchParams.get("key") || authHeader?.replace(/^Bearer\s+/i, "") || "";

    let accountId: string | undefined = searchParams.get("accountId") || undefined;

    if (requestedKey) {
      const auth = verifyApiKeyConstantTime(requestedKey);
      if (auth.valid && auth.account) {
        accountId = auth.account.id;
      }
    }

    if (!accountId) {
      // Default to primary account
      const defaultAcc = getAgentAccount();
      if (defaultAcc) {
        accountId = defaultAcc.id;
      }
    }

    const keys = listApiKeys(accountId);
    return NextResponse.json({
      success: true,
      keys,
      count: keys.length,
    });
  } catch (error: any) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal database error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, keyId, type = "live" } = body;

    // Resolve target account
    let accountId = body.accountId;
    if (!accountId) {
      const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
      if (authHeader) {
        const auth = verifyApiKeyConstantTime(authHeader);
        if (auth.valid && auth.account) {
          accountId = auth.account.id;
        }
      }
    }

    if (!accountId) {
      const defaultAcc = getAgentAccount();
      if (defaultAcc) {
        accountId = defaultAcc.id;
      }
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Target agent account not found" },
        { status: 404 }
      );
    }

    if (action === "revoke") {
      if (!keyId) {
        return NextResponse.json(
          { success: false, error: "keyId is required to revoke an API key" },
          { status: 400 }
        );
      }
      const revoked = revokeApiKey(keyId, accountId);
      return NextResponse.json({
        success: true,
        revoked,
        message: "Key invalidated immediately. Hash removed from active authentication.",
      });
    }

    // Default action: generate
    const newKeyRecord = createAgentApiKey(accountId, type === "test" ? "test" : "live");

    return NextResponse.json({
      success: true,
      id: newKeyRecord.id,
      apiKey: newKeyRecord.key,
      keyHint: newKeyRecord.keyHint,
      prefix: newKeyRecord.prefix,
      createdAt: newKeyRecord.createdAt,
      warning: "Copy this key now. It will never be displayed again.",
    });
  } catch (error: any) {
    console.error("Error managing API keys:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
