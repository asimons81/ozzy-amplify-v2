import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getYouTubeTranscript } from '@/lib/youtube/transcript';
import { generateObject } from 'ai';
import { geminiFlash } from '@/lib/ai/gemini';
import { YOUTUBE_EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';

const NuggetSchema = z.object({
  nuggets: z.array(z.object({
    insight: z.string(),
    quote: z.string().nullable(),
    timestamp: z.string().nullable(),
    tweet_angle: z.string(),
    hook_suggestion: z.string(),
  })),
  video_summary: z.string(),
  main_themes: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const videoUrl = typeof body?.videoUrl === 'string' ? body.videoUrl : '';
    const extractNuggets = body?.extractNuggets ?? true;

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
    }

    const result = await getYouTubeTranscript(videoUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    let nuggets = null;
    if (extractNuggets && result.transcript) {
      try {
        const prompt = YOUTUBE_EXTRACTION_PROMPT
          .replace("{{TRANSCRIPT}}", result.transcript)
          .replace("{{TITLE}}", result.metadata?.title || "Unknown")
          .replace("{{CHANNEL}}", result.metadata?.channel || "Unknown");

        const { object } = await generateObject({
          model: geminiFlash as any,
          schema: NuggetSchema,
          prompt,
        });
        nuggets = object;
      } catch (error) {
        console.error("Nugget extraction error:", error);
        // Continue without nuggets if it fails
      }
    }

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      metadata: result.metadata,
      nuggets,
    });
  } catch (error) {
    console.error('YouTube transcript route error:', error);
    return NextResponse.json(
      { error: 'Failed to process YouTube transcript request' },
      { status: 500 }
    );
  }
}
