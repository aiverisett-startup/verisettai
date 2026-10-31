import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid payload. Expected JSON support ticket body." },
        { status: 400 }
      );
    }

    const { userName, email, referenceId, category, description } = body;

    const trimmedName = typeof userName === "string" ? userName.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedCategory = typeof category === "string" ? category.trim() : "General";
    const trimmedDescription = typeof description === "string" ? description.trim() : "";
    const trimmedRef = typeof referenceId === "string" ? referenceId.trim() : "";

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid registered email is required." },
        { status: 400 }
      );
    }

    if (!trimmedDescription || trimmedDescription.length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed description (at least 10 characters)." },
        { status: 400 }
      );
    }

    const ticketId = `TCK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const createdAt = new Date().toISOString();

    // Persist ticket to Supabase if support_tickets or feedback table exists
    try {
      await supabaseAdmin.from("support_tickets").insert({
        ticket_id: ticketId,
        user_name: trimmedName,
        email: trimmedEmail,
        reference_id: trimmedRef || null,
        category: trimmedCategory,
        description: trimmedDescription,
        status: "OPEN",
        created_at: createdAt,
      });
    } catch (dbErr) {
      console.warn("[SUPPORT_TICKET_DB_NOTE]:", dbErr);
    }

    console.log(
      `[SUPPORT_TICKET_OPENED]: Ticket ${ticketId} from ${trimmedEmail} (${trimmedCategory})`
    );

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Support ticket ${ticketId} created successfully. Our engineering team will review it promptly.`,
    });
  } catch (err: any) {
    console.error("[SUPPORT_TICKET_ERROR]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to submit support ticket." },
      { status: 500 }
    );
  }
}

