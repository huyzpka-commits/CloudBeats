import { create } from "zustand";
import type { Track, PlayerState, PlayerStatus } from "@/types";

interface PlayerStore extends PlayerStatus {
  play: (track: Track, accountId: string) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setCurrentTime: (time: number) => void;
  setState: (state: PlayerState) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  state: "idle",
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  queue: [],
  queueIndex: -1,
  repeat: "off",
  shuffle: false,

  play: (track) => {
    const audio = document.querySelector("audio")!;
    audio.src = `/api/stream/${track.provider}?fileId=${encodeURIComponent(track.fileId)}&accountId=${encodeURIComponent(track.accountId)}`;
    audio.volume = get().volume;
    void audio.play();

    set({
      state: "playing",
      currentTrack: track,
      duration: track.duration,
      currentTime: 0,
    });
  },

  pause: () => {
    document.querySelector("audio")?.pause();
    set({ state: "paused" });
  },

  resume: () => {
    void document.querySelector("audio")?.play();
    set({ state: "playing" });
  },

  seek: (time) => {
    const audio = document.querySelector("audio")!;
    audio.currentTime = time;
    set({ currentTime: time });
  },

  setVolume: (volume) => {
    const audio = document.querySelector("audio")!;
    audio.volume = volume;
    set({ volume });
  },

  next: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (repeat === "one") {
      nextIndex = queueIndex;
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = repeat === "all" ? 0 : -1;
      }
    }

    if (nextIndex < 0) {
      set({ state: "idle", currentTrack: null });
      return;
    }

    const nextTrack = queue[nextIndex];
    const audio = document.querySelector("audio")!;
    audio.src = `/api/stream/${nextTrack.provider}?fileId=${encodeURIComponent(nextTrack.fileId)}&accountId=${encodeURIComponent(nextTrack.accountId)}`;
    void audio.play();

    set({
      currentTrack: nextTrack,
      queueIndex: nextIndex,
      state: "playing",
      currentTime: 0,
      duration: nextTrack.duration,
    });
  },

  prev: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    const prevIndex = Math.max(0, queueIndex - 1);
    const prevTrack = queue[prevIndex];
    if (!prevTrack) return;

    const audio = document.querySelector("audio")!;
    audio.src = `/api/stream/${prevTrack.provider}?fileId=${encodeURIComponent(prevTrack.fileId)}&accountId=${encodeURIComponent(prevTrack.accountId)}`;
    void audio.play();

    set({
      currentTrack: prevTrack,
      queueIndex: prevIndex,
      state: "playing",
      currentTime: 0,
      duration: prevTrack.duration,
    });
  },

  setQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, queueIndex: startIndex });
    if (tracks[startIndex]) {
      get().play(tracks[startIndex]);
    }
  },

  toggleRepeat: () => {
    const order: PlayerStatus["repeat"][] = ["off", "one", "all"];
    const current = order.indexOf(get().repeat);
    set({ repeat: order[(current + 1) % 3] });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setState: (state) => set({ state }),
}));
