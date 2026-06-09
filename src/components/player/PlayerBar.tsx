"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player-store";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, Repeat, Repeat1, Shuffle, Heart,
} from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const store = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => store.setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (store.currentTrack && audio.duration && isFinite(audio.duration)) {
        usePlayerStore.setState({ duration: audio.duration });
      }
    };
    const onEnded = () => store.next();
    const onError = () => store.setState("error");

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [store]);

  const progress = store.duration > 0
    ? (store.currentTime / store.duration) * 100
    : 0;

  const RepeatIcon = store.repeat === "one" ? Repeat1 : Repeat;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <div className="fixed bottom-0 left-0 right-0 h-player bg-surface-container border-t border-outline/20 backdrop-blur-xl z-50 flex items-center px-6 gap-6">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[280px] min-w-0">
          {store.currentTrack?.albumArtUrl ? (
            <img
              src={store.currentTrack.albumArtUrl}
              alt=""
              className="w-12 h-12 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-surface-container-high flex items-center justify-center">
              <Play size={16} className="text-on-surface-variant" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">
              {store.currentTrack?.title ?? "No track selected"}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {store.currentTrack?.artist ?? "—"}
            </p>
          </div>
          <button className="ml-auto text-on-surface-variant hover:text-primary transition-colors">
            <Heart size={16} />
          </button>
        </div>

        {/* Playback controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
          <div className="flex items-center gap-4">
            <button
              onClick={store.toggleShuffle}
              className={`transition-colors ${store.shuffle ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={store.prev} className="text-on-surface hover:text-primary transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={store.state === "playing" ? store.pause : store.resume}
              className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors"
            >
              {store.state === "playing" ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={store.next} className="text-on-surface hover:text-primary transition-colors">
              <SkipForward size={18} />
            </button>
            <button
              onClick={store.toggleRepeat}
              className={`transition-colors ${store.repeat !== "off" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <RepeatIcon size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-10 text-right tabular-nums">{formatTime(store.currentTime)}</span>
            <div
              className="flex-1 h-1 bg-outline/30 rounded-full cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                store.seek(pct * store.duration);
              }}
            >
              <div
                className="h-full bg-primary rounded-full transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>
            <span className="w-10 tabular-nums">{formatTime(store.duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-[150px]">
          <Volume2 size={16} className="text-on-surface-variant" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={store.volume}
            onChange={(e) => store.setVolume(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1"
          />
        </div>
      </div>
    </>
  );
}
