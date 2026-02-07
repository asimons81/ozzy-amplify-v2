"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GenerateForm } from "@/components/generate/GenerateForm";
import { OutputCard } from "@/components/generate/OutputCard";
import { ViralHeatmap } from "@/components/generate/ViralHeatmap";

interface GenerationResult {
  id: string;
  content: string;
  created_at: string;
  viral_score?: {
    overall: number;
    breakdown: {
      hook_strength: { score: number; reasoning: string };
      readability: { score: number; reasoning: string };
      whitespace: { score: number; reasoning: string };
      emotional_pull: { score: number; reasoning: string };
      cta_clarity?: { score: number; reasoning: string };
      uniqueness: { score: number; reasoning: string };
    };
  };
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const [initialContent, setInitialContent] = useState("");
  const [generation, setGeneration] = useState<GenerationResult | null>(null);

  useEffect(() => {
    const source = searchParams.get("source");
    if (source) {
      setInitialContent(decodeURIComponent(source));
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase tracking-tight">The Amplify Protocol</h2>
        <p className="text-slate-300">
          Turn ideas, transcripts, and notes into high-performing X content.
        </p>
      </div>

      <GenerateForm 
        onGenerated={setGeneration} 
        initialValue={initialContent}
      />

      {generation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10 border-t border-slate-800">
          <div className="lg:col-span-2">
            <OutputCard
              content={generation.content}
              createdAt={generation.created_at}
            />
          </div>
          <div>
            {generation.viral_score && (
              <ViralHeatmap
                overall={generation.viral_score.overall}
                scores={[
                  {
                    label: "Hook strength",
                    value: generation.viral_score.breakdown.hook_strength.score,
                    detail: generation.viral_score.breakdown.hook_strength.reasoning,
                  },
                  {
                    label: "Readability",
                    value: generation.viral_score.breakdown.readability.score,
                    detail: generation.viral_score.breakdown.readability.reasoning,
                  },
                  {
                    label: "Whitespace",
                    value: generation.viral_score.breakdown.whitespace.score,
                    detail: generation.viral_score.breakdown.whitespace.reasoning,
                  },
                  {
                    label: "Emotional pull",
                    value: generation.viral_score.breakdown.emotional_pull.score,
                    detail: generation.viral_score.breakdown.emotional_pull.reasoning,
                  },
                  {
                    label: "Uniqueness",
                    value: generation.viral_score.breakdown.uniqueness.score,
                    detail: generation.viral_score.breakdown.uniqueness.reasoning,
                  },
                  ...(generation.viral_score.breakdown.cta_clarity
                    ? [
                        {
                          label: "CTA clarity",
                          value:
                            generation.viral_score.breakdown.cta_clarity.score,
                          detail:
                            generation.viral_score.breakdown.cta_clarity.reasoning,
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
