export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
      <p className="text-slate-300">
        Your content engine is ready. Select a tool from the sidebar to get
        started.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Generate viral posts",
          "Analyze YouTube content",
          "Refine your tone of voice",
        ].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <p className="text-sm text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
