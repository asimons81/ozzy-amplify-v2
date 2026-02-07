import { generateObject } from "ai";
import { z } from "zod";
import { geminiFlash } from "@/lib/ai/gemini";
import { VIRAL_SCORING_PROMPT } from "@/lib/ai/prompts";

const ViralScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  breakdown: z.object({
    hook_strength: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
    readability: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
    whitespace: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
    emotional_pull: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
    cta_clarity: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
    uniqueness: z.object({
      score: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
  }),
  suggestions: z.array(z.string()),
});

export type ViralScore = z.infer<typeof ViralScoreSchema>;

interface Heuristics {
  charCount: number;
  lineBreaks: number;
  hasHookWord: boolean;
  hasQuestion: boolean;
  hasNumbers: boolean;
  emojiCount: number;
  readabilityScore: number;
}

export async function calculateViralScore(content: string): Promise<ViralScore> {
  const heuristics = calculateHeuristics(content);

  const { object: aiScore } = await generateObject({
    model: geminiFlash,
    schema: ViralScoreSchema,
    prompt: VIRAL_SCORING_PROMPT.replace("{{TWEET_CONTENT}}", content).concat(
      `\n\nHeuristic signals:\n- Character count: ${heuristics.charCount}\n- Line breaks: ${heuristics.lineBreaks}\n- Starts with hook word: ${heuristics.hasHookWord}\n- Has question: ${heuristics.hasQuestion}\n- Has numbers: ${heuristics.hasNumbers}\n- Emoji count: ${heuristics.emojiCount}\n- Readability score: ${heuristics.readabilityScore}`
    ),
  });

  return blendScores(heuristics, aiScore);
}

function calculateHeuristics(content: string): Heuristics {
  const hookWords = [
    "stop",
    "warning",
    "breaking",
    "unpopular",
    "hot take",
    "truth",
    "secret",
    "mistake",
    "nobody",
    "everyone",
    "here's",
    "this is",
    "i just",
    "thread",
    "reminder",
  ];

  const lines = content.split("\n").filter((line) => line.trim().length > 0);
  const words = content.split(/\s+/).filter(Boolean);
  const avgWordLength = words.length
    ? words.reduce((total, word) => total + word.length, 0) / words.length
    : 0;

  return {
    charCount: content.length,
    lineBreaks: Math.max(0, lines.length - 1),
    hasHookWord: hookWords.some((hook) =>
      content.toLowerCase().startsWith(hook)
    ),
    hasQuestion: content.includes("?"),
    hasNumbers: /\d/.test(content),
    emojiCount: (content.match(/\p{Emoji}/gu) || []).length,
    readabilityScore: clamp(
      100 - (avgWordLength - 4) * 10 - (words.length > 50 ? 20 : 0)
    ),
  };
}

function blendScores(heuristics: Heuristics, aiScore: ViralScore): ViralScore {
  const adjustments = {
    hook_strength: heuristics.hasHookWord ? 10 : -5,
    readability: (heuristics.readabilityScore - 50) / 5,
    whitespace: Math.min(20, heuristics.lineBreaks * 10),
  };

  return {
    ...aiScore,
    breakdown: {
      ...aiScore.breakdown,
      hook_strength: {
        ...aiScore.breakdown.hook_strength,
        score: clamp(aiScore.breakdown.hook_strength.score + adjustments.hook_strength),
      },
      readability: {
        ...aiScore.breakdown.readability,
        score: clamp(aiScore.breakdown.readability.score + adjustments.readability),
      },
      whitespace: {
        ...aiScore.breakdown.whitespace,
        score: clamp(aiScore.breakdown.whitespace.score + adjustments.whitespace),
      },
    },
    overall: clamp(
      (aiScore.overall + heuristics.readabilityScore) / 2 +
        (heuristics.hasHookWord ? 5 : 0)
    ),
  };
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
