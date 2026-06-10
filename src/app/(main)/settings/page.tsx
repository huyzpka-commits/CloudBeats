"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings as SettingsIcon, Cloud, Key, Database, CheckCircle, Loader2, Unlink } from "lucide-react";
import { signIn } from "next-auth/react";
import type { CloudAccount, CloudProvider } from "@/types";

const PROVIDERS: { name: string; id: CloudProvider | "azure-ad"; color: string }[] = [
  { name: "Google Drive", id: "google", color: "bg-blue-500 hover:bg-blue-600" },
  { name: "Dropbox", id: "dropbox", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "OneDrive", id: "azure-ad", color: "bg-sky-500 hover:bg-sky-600" },
];

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    const res = await fetch("/api/accounts");
    if (res.ok) {
      const data = await res.json();
      setAccounts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId);
    try {
      await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      await fetchAccounts();
    } finally {
      setDisconnecting(null);
    }
  };

  const isConnected = (id: string) => accounts.some((a) => a.provider === id || a.id.includes(id));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage your cloud connections and preferences
        </p>
      </div>

      {/* Cloud Accounts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-on-surface-variant" />
          <h2 className="text-sm font-semibold text-on-surface">Cloud Drives</h2>
        </div>

        <div className="space-y-2">
          {PROVIDERS.map((p) => {
            const connected = isConnected(p.id);
            const account = accounts.find((a) => a.provider === p.id || a.id.includes(p.id));

            return (
              <div
                key={p.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-high/40 border border-outline/10"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? "bg-emerald-500/20" : "bg-surface-container-highest"}`}>
                  {connected ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : (
                    <Cloud size={18} className="text-on-surface-variant" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{p.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {connected
                      ? `Connected as ${account?.email ?? account?.displayName ?? "User"}`
                      : "Not connected"
                    }
                  </p>
                </div>
                {connected ? (
                  <button
                    onClick={() => handleDisconnect(account!.id)}
                    disabled={disconnecting === account!.id}
                    className="px-4 py-2 rounded-xl bg-surface-container-high text-error text-xs font-semibold hover:bg-error/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {disconnecting === account!.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Unlink size={12} />
                    )}
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => signIn(p.id, { callbackUrl: "/library" })}
                    className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer ${p.color}`}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* API Keys hint */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-on-surface-variant" />
          <h2 className="text-sm font-semibold text-on-surface">API Configuration</h2>
        </div>
        <p className="text-xs text-on-surface-variant">
          Configure your cloud provider credentials in <code className="text-primary">.env.local</code>
        </p>
      </section>

      {/* Database */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-on-surface-variant" />
          <h2 className="text-sm font-semibold text-on-surface">Local Database</h2>
        </div>
        <p className="text-xs text-on-surface-variant">
          Track metadata is stored locally in SQLite. No data is sent to external servers.
        </p>
      </section>
    </div>
  );
}
