import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6">
      <main className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-10 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-500 font-bold">
          X-Amplify Protocol
        </p>
        <h1 className="text-4xl font-semibold text-white tracking-tight">
          Cyber-Industrial Content Engine
        </h1>
        <p className="text-base text-slate-300 max-w-xl mx-auto">
          Scale your X presence with precision. Generate viral-ready content, 
          mine YouTube transcripts for golden nuggets, and clone your unique 
          tone of voice.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-full bg-cyan-500 px-8 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:scale-105"
          >
            Launch Engine
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-slate-700 bg-slate-800/50 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:border-slate-600"
          >
            Sign In
          </Link>
        </div>
        <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/50">
          <div>
            <p className="text-xl font-bold text-white">Gemini 2.0</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Processing</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">Supabase</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Vault Architecture</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">Next.js 15</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Core Engine</p>
          </div>
        </div>
      </main>
    </div>
  );
}
