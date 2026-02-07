import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { geminiFlash } from "@/lib/ai/gemini";
import { TONE_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { z } from "zod";

const ToneProfileSchema = z.object({
  formality: z.number().min(0).max(1),
  humor: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
  directness: z.number().min(0).max(1),
  emoji_usage: z.enum(["none", "rare", "moderate", "frequent"]),
  avg_sentence_length: z.enum(["short", "medium", "long"]),
  vocabulary_level: z.enum(["simple", "conversational", "sophisticated", "technical"]),
  signature_phrases: z.array(z.string()),
  punctuation_style: z.enum(["minimal", "standard", "expressive"]),
  capitalization: z.enum(["standard", "emphasis", "shouting"]),
  paragraph_breaks: z.boolean(),
  hashtag_style: z.enum(["none", "minimal", "moderate", "heavy"]),
  question_frequency: z.enum(["rare", "occasional", "frequent"]),
  call_to_action_style: z.enum(["none", "subtle", "direct"]),
  key_themes: z.array(z.string()),
  writing_summary: z.string(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sampleTweets } = await req.json();

  if (!sampleTweets || !Array.isArray(sampleTweets) || sampleTweets.length === 0) {
    return NextResponse.json({ error: "Missing sample tweets" }, { status: 400 });
  }

  const tweetsText = sampleTweets.join("\n---\n");
  const prompt = TONE_ANALYSIS_PROMPT.replace("{{SAMPLE_TWEETS}}", tweetsText);

  try {
    const { object: toneProfile } = await generateObject({
      model: geminiFlash,
      schema: ToneProfileSchema,
      prompt,
    });

    return NextResponse.json({
      success: true,
      toneProfile,
    });
  } catch (error) {
    console.error("Persona analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze tone of voice" },
      { status: 500 }
    );
  }
}
