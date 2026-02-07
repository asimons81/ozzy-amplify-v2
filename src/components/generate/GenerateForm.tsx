"use client";

import { useState, useEffect } from "react";

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
    suggestions?: string[];
  };
}

interface GenerateFormProps {
  onGenerated: (generation: GenerationResult) => void;
  initialValue?: string;
}

export function GenerateForm({ onGenerated, initialValue = "" }: GenerateFormProps) {
  const [sourceContent, setSourceContent] = useState(initialValue);
  const [userInstructions, setUserInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update sourceContent when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setSourceContent(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent,
          sourceType: "manual",
          userInstructions,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        setError(data.error || "Generation failed");
        return;
      }

      onGenerated(data.generation as GenerationResult);
    } catch (err) {
      console.error(err);
      setError("Generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          Source content
        </label>
        <textarea
          className="min-h-[160px] w-full rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          placeholder="Paste ideas, notes, or a transcript snippet..."
          value={sourceContent}
          onChange={(event) => setSourceContent(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          Extra instructions (optional)
        </label>
        <textarea
          className="min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          placeholder="Add a target audience, vibe, or call-to-action..."
          value={userInstructions}
          onChange={(event) => setUserInstructions(event.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
      >
        {isLoading ? "Generating..." : "Generate tweet"}
      </button>
    </form>
  );
}
