"use client";

import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Search</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Search across all connected cloud drives
        </p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          className="w-full pl-12 pr-4 py-3 bg-surface-container-high/50 text-on-surface rounded-xl border border-outline/20 placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50"
        />
      </div>

      <div className="flex items-center justify-center h-[400px] text-on-surface-variant">
        <p className="text-sm">Connect a cloud drive and scan for music to get started</p>
      </div>
    </div>
  );
}
