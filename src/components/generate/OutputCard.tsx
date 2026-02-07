"use client";

import { useState } from "react";

interface OutputCardProps {
  content: string;
  createdAt?: string;
}

export function OutputCard({ content, createdAt }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Generated output</h3>
        {createdAt && (
          <span className="text-xs text-slate-500">
            {new Date(createdAt).toLocaleString()}
          </span>
        )}
      </div>
      <p className="whitespace-pre-line text-base text-slate-200">
        {content}
      </p>
      <button
        onClick={handleCopy}
        className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
      >
        {copied ? "Copied" : "Copy to clipboard"}
      </button>
    </div>
  );
}
