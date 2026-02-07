import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing Clerk webhook secret" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headerList = await headers();

  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const webhook = new Webhook(webhookSecret);

  let event: { type: string; data: Record<string, unknown> };

  try {
    event = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data as {
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string | null;
        email_addresses?: Array<{
          email_address: string;
          id: string;
        }>;
        primary_email_address_id?: string | null;
      };

      const primaryEmail = data.email_addresses?.find(
        (email) => email.id === data.primary_email_address_id
      )?.email_address;

      const fallbackEmail = data.email_addresses?.[0]?.email_address;

      const fullName = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ");

      await supabase.from("profiles").upsert(
        {
          clerk_id: data.id,
          email: primaryEmail || fallbackEmail || null,
          full_name: fullName || null,
          avatar_url: data.image_url || null,
        },
        {
          onConflict: "clerk_id",
        }
      );
    }

    if (event.type === "user.deleted") {
      const data = event.data as { id: string };
      await supabase.from("profiles").delete().eq("clerk_id", data.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
