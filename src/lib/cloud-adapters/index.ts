import type { CloudProvider, CloudFile } from "@/types";
import { SUPPORTED_EXTENSIONS, MIME_MAP } from "@/types";
import { GoogleDriveAdapter } from "./google";
import { DropboxAdapter } from "./dropbox";
import { OneDriveAdapter } from "./onedrive";

export type { CloudFile } from "@/types";

export function getAdapter(provider: CloudProvider): CloudAdapter {
  switch (provider) {
    case "google": return new GoogleDriveAdapter();
    case "dropbox": return new DropboxAdapter();
    case "onedrive": return new OneDriveAdapter();
  }
}

export interface CloudAdapter {
  provider: CloudProvider;
  listFiles(accessToken: string, parentId?: string): Promise<CloudFile[]>;
  streamUrl(accessToken: string, fileId: string): Promise<string>;
  getStreamHeaders?(accessToken: string): Record<string, string>;
  search(accessToken: string, query: string): Promise<CloudFile[]>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }>;
}

export function isAudioFile(file: CloudFile): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if ((SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) return true;
  return Object.keys(MIME_MAP).some((mime) => file.mimeType === mime);
}

export function parseAudioFormat(file: CloudFile): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext in MIME_MAP || Object.values(MIME_MAP).includes(ext as never)) return ext;
  const mimeMatch = MIME_MAP[file.mimeType];
  return mimeMatch ?? "mp3";
}
