import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminSupabaseClient();
  
  // Get profile ID first
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: personas, error } = await adminSupabase
    .from("personas")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, personas });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, tone_profile, sample_tweets, is_default } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // If setting as default, unset other defaults first
  if (is_default) {
    await adminSupabase
      .from("personas")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  const { data: persona, error } = await adminSupabase
    .from("personas")
    .insert({
      user_id: profile.id,
      name,
      description,
      tone_profile,
      sample_tweets,
      is_default: is_default || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, persona });
}
