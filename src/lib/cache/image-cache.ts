import type { Track, CloudProvider } from "@/types";

const CACHE_MAX = 2000;
const cache = new Map<string, { url: string; timestamp: number }>();

export function getCachedArtUrl(trackId: string): string | null {
  const entry = cache.get(trackId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > 3600000) {
    cache.delete(trackId);
    return null;
  }
  return entry.url;
}

export function setCachedArtUrl(trackId: string, url: string): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(trackId, { url, timestamp: Date.now() });
}

export function invalidateCache(trackId?: string): void {
  if (trackId) cache.delete(trackId);
  else cache.clear();
}

export function generateArtProxyUrl(
  provider: CloudProvider,
  fileId: string,
  accountId: string,
  size: number = 96,
): string {
  return `/api/art/${provider}?fileId=${encodeURIComponent(fileId)}&accountId=${encodeURIComponent(accountId)}&size=${size}`;
}

export function getImageSrcSet(
  provider: CloudProvider,
  fileId: string,
  accountId: string,
): string {
  const sizes = [48, 96, 192, 384];
  return sizes
    .map(
      (s) =>
        `${generateArtProxyUrl(provider, fileId, accountId, s)} ${s}w`
    )
    .join(", ");
}
