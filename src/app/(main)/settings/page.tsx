"use client";

import { Settings as SettingsIcon, Cloud, Key, Database } from "lucide-react";
import { signIn } from "next-auth/react";

const PROVIDERS = [
  { name: "Google Drive" as const, id: "google" as const },
  { name: "Dropbox" as const, id: "dropbox" as const },
  { name: "OneDrive" as const, id: "azure-ad" as const },
];

export default function SettingsPage() {
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
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-high/40 border border-outline/10"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                <Cloud size={18} className="text-on-surface-variant" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{p.name}</p>
                <p className="text-xs text-on-surface-variant">Not connected</p>
              </div>
              <button
                onClick={() => signIn(p.id, { callbackUrl: "/library" })}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Connect
              </button>
            </div>
          ))}
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
