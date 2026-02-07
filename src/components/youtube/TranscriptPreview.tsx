"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TranscriptPreviewProps {
  transcript: string;
  metadata: {
    title: string;
    channel: string;
  };
}

export function TranscriptPreview({ transcript, metadata }: TranscriptPreviewProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{metadata.title}</h3>
          <p className="text-slate-400 text-sm">{metadata.channel}</p>
        </div>
        <Link
          href={`/generate?source=${encodeURIComponent(transcript.slice(0, 1000))}`}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Amplify This <Sparkles className="h-4 w-4" />
        </Link>
      </div>

      <div className="bg-slate-950/40 rounded-2xl p-6 border border-slate-800 max-h-[300px] overflow-y-auto">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      </div>
      
      <p className="text-xs text-slate-500 italic">
        Tip: You can highlight specific sections and click "Amplify" to focus the AI on those nuggets.
      </p>
    </div>
  );
}
