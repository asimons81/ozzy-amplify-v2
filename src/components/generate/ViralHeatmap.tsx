interface ScoreItem {
  label: string;
  value: number;
  detail?: string;
}

interface ViralHeatmapProps {
  overall: number;
  scores: ScoreItem[];
}

const scoreTone = (value: number) => {
  if (value >= 80) return "bg-emerald-400 text-emerald-50";
  if (value >= 60) return "bg-lime-400 text-slate-950";
  if (value >= 40) return "bg-amber-400 text-slate-950";
  return "bg-rose-400 text-rose-50";
};

const barTone = (value: number) => {
  if (value >= 80) return "from-emerald-400 to-emerald-500";
  if (value >= 60) return "from-lime-400 to-lime-500";
  if (value >= 40) return "from-amber-400 to-amber-500";
  return "from-rose-400 to-rose-500";
};

export function ViralHeatmap({ overall, scores }: ViralHeatmapProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Amplify Protocol Viral Heatmap
          </p>
          <h3 className="text-lg font-semibold text-slate-100">
            Viral Momentum Score
          </h3>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${scoreTone(overall)}`}
        >
          {overall}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {scores.map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">
                {score.label}
              </span>
              <span className="text-slate-400">{score.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${barTone(score.value)}`}
                style={{ width: `${Math.min(100, Math.max(0, score.value))}%` }}
              />
            </div>
            {score.detail && (
              <p className="text-xs text-slate-500">{score.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
