import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { GENERATION_PROMPT } from "@/lib/ai/prompts";
import { calculateViralScore } from "@/lib/ai/viral-scorer";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type GenerateRequest = {
  sourceContent: string;
  sourceType?: "manual" | "youtube" | "article" | "thread";
  sourceUrl?: string | null;
  personaId?: string | null;
  userInstructions?: string | null;
  threadMode?: boolean;
};

export async function POST(req: Request) {
  const authData = await auth();
  const { userId } = authData;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as GenerateRequest;

  if (!body?.sourceContent?.trim()) {
    return NextResponse.json({ error: "Missing source content" }, { status: 400 });
  }

  // Use the admin client to bypass JWT issues for the MVP
  const adminSupabase = createAdminSupabaseClient();

  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, credits_balance")
    .eq("clerk_id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if ((profile as any).credits_balance <= 0) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const { data: persona } = await adminSupabase
    .from("personas")
    .select("tone_profile, sample_tweets")
    .eq("id", body.personaId || "")
    .maybeSingle();

  const toneProfile = persona?.tone_profile || {
    formality: 0.5,
    humor: 0.5,
    energy: 0.6,
    directness: 0.6,
    emoji_usage: "moderate",
    avg_sentence_length: "medium",
    vocabulary_level: "conversational",
    signature_phrases: [],
    punctuation_style: "standard",
    capitalization: "standard",
    paragraph_breaks: false,
    hashtag_style: "minimal",
    question_frequency: "occasional",
    call_to_action_style: "subtle",
    key_themes: [],
    writing_summary: "Balanced, conversational tone.",
  };

  const sampleTweets = Array.isArray(persona?.sample_tweets)
    ? persona.sample_tweets.join("\n")
    : "";

  const prompt = GENERATION_PROMPT.replace(
    "{{TONE_PROFILE}}",
    JSON.stringify(toneProfile, null, 2)
  )
    .replace("{{SAMPLE_TWEETS}}", sampleTweets)
    .replace("{{SOURCE_CONTENT}}", body.sourceContent)
    .replace("{{USER_INSTRUCTIONS}}", body.userInstructions || "");

  try {
    const { text } = await generateText({
      model: geminiFlash,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    const trimmedContent = text.trim();
    const viralScore = await calculateViralScore(trimmedContent);

    const { data: generation, error: generationError } = await adminSupabase
      .from("generations")
      .insert({
        user_id: profile.id,
        persona_id: body.personaId || null,
        source_type: body.sourceType || "manual",
        source_url: body.sourceUrl || null,
        source_content: body.sourceContent,
        content: trimmedContent,
        thread_content: body.threadMode ? trimmedContent.split("\n") : null,
        viral_score: viralScore,
        credits_used: 1,
      })
      .select("id, content, created_at, viral_score")
      .single();

    if (generationError || !generation) {
      return NextResponse.json(
        { error: "Failed to save generation" },
        { status: 500 }
      );
    }

    await adminSupabase.rpc("deduct_credits", {
      p_user_id: profile.id,
      p_amount: 1,
      p_action: "generation",
      p_reference_type: "generation",
      p_reference_id: generation.id,
      p_metadata: {},
    });

    return NextResponse.json({
      success: true,
      generation,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
