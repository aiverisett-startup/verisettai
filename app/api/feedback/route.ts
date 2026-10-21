import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export interface FeedbackItem {
  id: string;
  name: string;
  role_title?: string | null;
  company?: string | null;
  rating: number;
  message: string;
  category: string;
  is_approved: boolean;
  created_at: string;
  is_just_posted?: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let query = supabaseAdmin
      .from("feedback")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.warn(`[Feedback GET Note] Supabase query: ${error.code} - ${error.message}`);
      return NextResponse.json({
        feedback: [],
        source: "database",
        total: 0,
      });
    }

    return NextResponse.json({
      feedback: data || [],
      source: "database",
      total: data?.length || 0,
    });
  } catch (err: any) {
    console.warn("[Feedback GET Exception]", err?.message || err);
    return NextResponse.json({
      feedback: [],
      source: "database",
      total: 0,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role_title, company, rating, message, category } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Author name is required" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Review message is required" }, { status: 400 });
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const selectedCategory = category || "Protocol Feedback";

    const sanitizedRecord = {
      name: String(name).trim(),
      role_title: role_title ? String(role_title).trim() : null,
      company: company ? String(company).trim() : null,
      rating: numericRating,
      message: String(message).trim(),
      category: selectedCategory,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    // Attempt insert with elevated service role to securely bypass RLS
    const { data, error } = await supabaseAdmin
      .from("feedback")
      .insert([sanitizedRecord])
      .select()
      .single();

    if (error) {
      console.warn(`[Feedback POST Note] Code: ${error.code}, Message: ${error.message}`);
      return NextResponse.json({
        error: error.message || "Failed to submit review to database",
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { ...data, is_just_posted: true },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Failed to process review submission",
    }, { status: 500 });
  }
}
