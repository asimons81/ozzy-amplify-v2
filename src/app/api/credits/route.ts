import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("clerk_id", userId)
    .single();

  if (error || !data) {
    console.error("Credit fetch error:", error);
    return NextResponse.json({ credits: 0 });
  }

  return NextResponse.json({ credits: data.credits_balance });
}
