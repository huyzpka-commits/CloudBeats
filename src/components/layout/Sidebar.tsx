"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Library, Search, Settings, Plus,
  Music, ListMusic, Cloud,
} from "lucide-react";
import type { CloudProvider } from "@/types";

const NAV_ITEMS = [
  { href: "/library", icon: Library, label: "Library" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const PROVIDER_AUTH_URLS: Record<CloudProvider, string> = {
  google: "/api/auth/signin/google",
  dropbox: "/api/auth/signin/dropbox",
  onedrive: "/api/auth/signin/azure-ad",
};

interface SidebarProps {
  connectedProviders: CloudProvider[];
  playlists?: { id: string; name: string }[];
}

export function Sidebar({ connectedProviders, playlists = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-sidebar-width h-screen bg-surface-container border-r border-outline/10 flex flex-col overflow-hidden fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Music size={18} className="text-primary" />
        </div>
        <span className="text-lg font-bold text-on-surface tracking-tight">CloudBeats</span>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${pathname === href ? "bg-primary/15 text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface"}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 my-4 h-px bg-outline/15" />

      {/* Cloud accounts */}
      <div className="px-3 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
          Cloud Drives
        </p>
        {(Object.keys(PROVIDER_AUTH_URLS) as CloudProvider[]).map((provider) => {
          const isConnected = connectedProviders.includes(provider);
          return (
            <Link
              key={provider}
              href={isConnected ? "/settings" : PROVIDER_AUTH_URLS[provider]}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isConnected ? "text-on-surface-variant hover:bg-surface-container-high/50" : "text-on-surface-variant/60 hover:bg-surface-container-high/30 hover:text-on-surface-variant"}`}
            >
              <CloudIcon provider={provider} connected={isConnected} />
              <span className="capitalize">{provider === "google" ? "Google Drive" : provider === "dropbox" ? "Dropbox" : "OneDrive"}</span>
              {isConnected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-5 my-4 h-px bg-outline/15" />

      {/* Playlists */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">
            Playlists
          </p>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Plus size={14} />
          </button>
        </div>
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            href={`/library?playlist=${pl.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface transition-colors"
          >
            <ListMusic size={16} />
            <span className="truncate">{pl.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function CloudIcon({ provider, connected }: { provider: CloudProvider; connected: boolean }) {
  const colorClass = connected
    ? provider === "google" ? "text-blue-400"
      : provider === "dropbox" ? "text-blue-500"
      : "text-sky-400"
    : "text-on-surface-variant/40";

  return <Cloud size={18} className={colorClass} />;
}
