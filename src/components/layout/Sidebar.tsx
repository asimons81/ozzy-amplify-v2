import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generate", label: "Generate" },
  { href: "/youtube", label: "YouTube" },
  { href: "/personas", label: "Personas" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-[#0b1220] p-6">
      <div className="text-lg font-semibold tracking-wide text-white">
        X-Amplify
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        Cyber Industrial
      </p>
      <nav className="mt-8 flex flex-col gap-2 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        <p className="font-medium text-slate-200">Tip</p>
        <p className="mt-1">AI credits reset monthly based on your plan.</p>
      </div>
    </aside>
  );
}
