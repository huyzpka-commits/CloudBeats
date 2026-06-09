"use client";

import { Cloud, CloudOff, RefreshCw, Loader2 } from "lucide-react";
import type { CloudAccount, CloudProvider } from "@/types";

const PROVIDER_META: Record<CloudProvider, { label: string; color: string; bgColor: string }> = {
  google: { label: "Google Drive", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  dropbox: { label: "Dropbox", color: "text-blue-500", bgColor: "bg-blue-600/10" },
  onedrive: { label: "OneDrive", color: "text-sky-400", bgColor: "bg-sky-500/10" },
};

interface CloudAccountCardProps {
  account: CloudAccount;
  trackCount: number;
  isScanning: boolean;
  onScan: (accountId: string) => void;
  onDisconnect: (accountId: string) => void;
}

export function CloudAccountCard({
  account,
  trackCount,
  isScanning,
  onScan,
  onDisconnect,
}: CloudAccountCardProps) {
  const meta = PROVIDER_META[account.provider];
  const isConnected = account.status === "connected";

  return (
    <div className={`rounded-lg p-4 border-l-4 transition-colors
      ${isConnected ? "border-l-primary bg-surface-container-high/40 hover:bg-surface-container-high/60" : "border-l-on-surface-variant bg-surface-container/30 opacity-60"}`}
    >
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-on-surface-variant"}`} />

        {/* Provider info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
            <span className="text-xs text-on-surface-variant">{account.email}</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {trackCount} tracks indexed
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isScanning ? (
            <Loader2 size={16} className="text-primary animate-spin" />
          ) : (
            <button
              onClick={() => onScan(account.id)}
              className="p-2 rounded-lg hover:bg-surface-container-highest/50 text-on-surface-variant hover:text-primary transition-colors"
              title="Scan for music"
            >
              <RefreshCw size={16} />
            </button>
          )}

          <button
            onClick={() => onDisconnect(account.id)}
            className="p-2 rounded-lg hover:bg-surface-container-highest/50 text-on-surface-variant hover:text-error transition-colors"
            title="Disconnect"
          >
            {isConnected ? <Cloud size={16} /> : <CloudOff size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
