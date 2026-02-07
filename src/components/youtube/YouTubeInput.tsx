"use client";

import { useState } from "react";
import { Search, Loader2, Youtube } from "lucide-react";

interface YouTubeInputProps {
  onTranscriptLoaded: (transcript: string, metadata: any) => void;
}

export function YouTubeInput({ onTranscriptLoaded }: YouTubeInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/youtube/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract transcript");
      }

      onTranscriptLoaded(data.transcript, data.metadata);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Youtube className="h-5 w-5 text-red-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-all"
          placeholder="Paste YouTube Video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleExtract}
          disabled={isLoading || !url}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Extract Gold
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-sm px-4">{error}</p>
      )}
    </div>
  );
}
