"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CreditDisplay } from "@/components/layout/CreditDisplay";

export function Header() {
  const { user } = useUser();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const fetchCredits = async () => {
      const response = await fetch("/api/credits");
      const data = await response.json();
      if (data.credits !== undefined) setCredits(data.credits);
    };

    fetchCredits();
    
    // Check every 30 seconds as fallback for real-time
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-[#0b1220] px-6 py-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
          Workspace
        </p>
        <h1 className="text-xl font-semibold text-slate-100">
          X-Amplify Dashboard
        </h1>
      </div>
      <CreditDisplay credits={credits} />
    </header>
  );
}
