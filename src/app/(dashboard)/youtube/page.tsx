"use client";

import { useState } from "react";
import { YouTubeInput } from "@/components/youtube/YouTubeInput";
import { TranscriptPreview } from "@/components/youtube/TranscriptPreview";

export default function YouTubePage() {
  const [data, setData] = useState<{ transcript: string; metadata: any } | null>(
    null
  );

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">YouTube Gold Mining</h2>
        <p className="text-slate-400 text-lg">
          Extract high-signal insights from any video and transform them into viral X threads.
        </p>
      </div>

      <YouTubeInput 
        onTranscriptLoaded={(transcript, metadata) => setData({ transcript, metadata })} 
      />

      {data && (
        <TranscriptPreview 
          transcript={data.transcript} 
          metadata={data.metadata} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-800/50">
        <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800">
          <h4 className="font-semibold text-white mb-2">How it works</h4>
          <p className="text-sm text-slate-400">
            We pull the official transcript (or use AI to generate one) from the video URL. Then, you can feed those raw insights into our Amplify Protocol to generate posts.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800">
          <h4 className="font-semibold text-white mb-2">Best Results</h4>
          <p className="text-sm text-slate-400">
            Works best with educational content, interviews, and long-form podcasts where the speaker shares unique insights or frameworks.
          </p>
        </div>
      </div>
    </div>
  );
}
