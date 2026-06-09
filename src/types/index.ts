export type CloudProvider = "google" | "dropbox" | "onedrive";

export type ConnectionStatus = "connected" | "disconnected" | "expired";

export type AudioFormat = "mp3" | "flac" | "wav" | "aac" | "ogg" | "m4a";

export const SUPPORTED_EXTENSIONS: AudioFormat[] = [
  "mp3", "flac", "wav", "aac", "ogg", "m4a",
];

export const MIME_MAP: Record<string, AudioFormat> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/flac": "flac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
};

export interface CloudAccount {
  id: string;
  provider: CloudProvider;
  displayName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
  status: ConnectionStatus;
}

export interface CloudFile {
  id: string;
  provider: CloudProvider;
  name: string;
  mimeType: string;
  size: number;
  parentId: string;
  path: string;
  modifiedTime: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

export interface Track {
  id: string;
  fileId: string;
  provider: CloudProvider;
  accountId: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  format: AudioFormat;
  bitrate: number;
  size: number;
  path: string;
  albumArtId?: string;
  albumArtUrl?: string;
  lastScanned: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export interface PlayerStatus {
  state: PlayerState;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  repeat: "off" | "one" | "all";
  shuffle: boolean;
}

export interface ScanProgress {
  provider: CloudProvider;
  totalFiles: number;
  processedFiles: number;
  currentPath: string;
  status: "scanning" | "indexing" | "complete" | "error";
}
