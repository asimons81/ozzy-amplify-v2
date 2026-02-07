import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  const { getToken } = await auth();

  const supabaseAccessToken = await getToken({
    template: "supabase",
  });

  if (!supabaseAccessToken) {
    throw new Error("Not authenticated");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  );
}
