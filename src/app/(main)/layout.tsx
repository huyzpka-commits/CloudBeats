"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { PlayerBar } from "@/components/player/PlayerBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar connectedProviders={[]} />
      <main className="flex-1 ml-sidebar-width pb-player-height overflow-y-auto">
        {children}
      </main>
      <PlayerBar />
    </div>
  );
}
