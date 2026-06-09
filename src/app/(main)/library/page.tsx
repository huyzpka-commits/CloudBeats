"use client";

import { useEffect, useState, useCallback } from "react";
import { VirtualTrackList } from "@/components/library/VirtualTrackList";
import { CloudAccountCard } from "@/components/cloud/CloudAccountCard";
import { usePlayerStore } from "@/stores/player-store";
import type { Track, CloudAccount, ScanProgress } from "@/types";

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [scanningIds, setScanningIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchTracks = useCallback(async () => {
    const res = await fetch("/api/tracks");
    if (res.ok) setTracks(await res.json());
  }, []);

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/accounts");
    if (res.ok) setAccounts(await res.json());
  }, []);

  useEffect(() => {
    Promise.all([fetchTracks(), fetchAccounts()]).finally(() => setLoading(false));
  }, [fetchTracks, fetchAccounts]);

  const handleScan = async (accountId: string) => {
    setScanningIds((prev) => new Set(prev).add(accountId));
    try {
      await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      await fetchTracks();
    } finally {
      setScanningIds((prev) => {
        const next = new Set(prev);
        next.delete(accountId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Library</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {tracks.length} tracks across {accounts.length} cloud drive{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
            Connected Drives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((account) => (
              <CloudAccountCard
                key={account.id}
                account={account}
                trackCount={tracks.filter((t) => t.accountId === account.id).length}
                isScanning={scanningIds.has(account.id)}
                onScan={handleScan}
                onDisconnect={() => {}}
              />
            ))}
          </div>
        </section>
      )}

      {/* Track list */}
      <section>
        <VirtualTrackList tracks={tracks} height={Math.min(600, tracks.length * 56 + 60)} />
      </section>
    </div>
  );
}
