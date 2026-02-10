export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#020617] text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
