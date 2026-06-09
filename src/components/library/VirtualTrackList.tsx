"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { usePlayerStore } from "@/stores/player-store";
import { Play, Pause, Music, Search, Cloud, CloudOff } from "lucide-react";
import type { Track, CloudProvider } from "@/types";

const PROVIDER_COLORS: Record<CloudProvider, string> = {
  google: "border-l-blue-500",
  dropbox: "border-l-blue-600",
  onedrive: "border-l-sky-500",
};

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  google: "Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

interface VirtualTrackListProps {
  tracks: Track[];
  height?: number;
  rowHeight?: number;
}

export function VirtualTrackList({ tracks, height = 600, rowHeight = 56 }: VirtualTrackListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const store = usePlayerStore();

  const filtered = useMemo(() => {
    if (!search) return tracks;
    const q = search.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [tracks, search]);

  const overscan = 5;
  const startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
  const endIdx = Math.min(filtered.length, startIdx + visibleCount);

  const visibleTracks = filtered.slice(startIdx, endIdx);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const isPlaying = (track: Track) =>
    store.state === "playing" && store.currentTrack?.id === track.id;

  const handlePlay = (track: Track, index: number) => {
    if (isPlaying(track)) {
      store.pause();
    } else {
      store.setQueue(filtered, index);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracks, artists, albums..."
          className="w-full pl-10 pr-4 py-3 bg-surface-container-high/50 text-on-surface rounded-xl border border-outline/20 placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 text-sm"
        />
      </div>

      {/* Track count */}
      <p className="text-xs text-on-surface-variant">
        {filtered.length} track{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Virtual list */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto rounded-lg"
        style={{ height, maxHeight: height }}
      >
        <div style={{ height: filtered.length * rowHeight, position: "relative" }}>
          {visibleTracks.map((track, i) => {
            const realIndex = startIdx + i;
            const playing = isPlaying(track);

            return (
              <div
                key={track.id}
                onClick={() => handlePlay(track, realIndex)}
                className={`absolute left-0 right-0 flex items-center gap-3 px-3 cursor-pointer transition-colors rounded-md
                  ${playing ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high/50 text-on-surface"}`}
                style={{ top: realIndex * rowHeight, height: rowHeight }}
              >
                {/* Album art or placeholder */}
                {track.albumArtUrl ? (
                  <img
                    src={track.albumArtUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-md object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <Music size={14} className="text-on-surface-variant" />
                  </div>
                )}

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {track.artist || "Unknown Artist"} {track.album ? `· ${track.album}` : ""}
                  </p>
                </div>

                {/* Provider badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-l-2 ${PROVIDER_COLORS[track.provider]} bg-surface-container-high text-on-surface-variant`}>
                  {PROVIDER_LABELS[track.provider]}
                </span>

                {/* Duration */}
                <span className="text-xs text-on-surface-variant tabular-nums w-10 text-right">
                  {track.duration ? formatDuration(track.duration) : "—"}
                </span>

                {/* Play/Pause indicator */}
                <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary">
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
