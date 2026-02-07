interface CreditDisplayProps {
  credits: number;
}

export function CreditDisplay({ credits }: CreditDisplayProps) {
  return (
    <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
      <span className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
        Credits
      </span>
      <span className="ml-2 text-lg font-semibold text-white">{credits}</span>
    </div>
  );
}
