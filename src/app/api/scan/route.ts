import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { tracks, accounts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { GoogleDriveAdapter } from "@/lib/cloud-adapters/google";
import { DropboxAdapter } from "@/lib/cloud-adapters/dropbox";
import { OneDriveAdapter } from "@/lib/cloud-adapters/onedrive";
import { isAudioFile, parseAudioFormat } from "@/lib/cloud-adapters";
import type { CloudProvider, CloudAccount } from "@/types";

function getAdapter(provider: CloudProvider) {
  switch (provider) {
    case "google": return new GoogleDriveAdapter();
    case "dropbox": return new DropboxAdapter();
    case "onedrive": return new OneDriveAdapter();
  }
}

async function ensureValidToken(account: CloudAccount): Promise<string> {
  if (Date.now() < account.tokenExpiresAt) return account.accessToken;

  const adapter = getAdapter(account.provider);
  const refreshed = await adapter.refreshToken(account.refreshToken);

  const db = getDb();
  await db.update(accounts).set({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    tokenExpiresAt: refreshed.expiresAt,
    status: "connected",
  }).where(eq(accounts.id, account.id));

  return refreshed.accessToken;
}

export async function POST(req: NextRequest) {
  const { accountId } = await req.json();
  const db = getDb();

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const adapter = getAdapter(account.provider);
  const token = await ensureValidToken(account);
  const allFiles = await adapter.listFiles(token);
  const audioFiles = allFiles.filter(isAudioFile);

  let newCount = 0;
  const batchSize = 50;

  for (let i = 0; i < audioFiles.length; i += batchSize) {
    const batch = audioFiles.slice(i, i + batchSize);

    const insertBatch = batch.map((file) => ({
      id: `${account.provider}-${file.id}`,
      fileId: file.id,
      provider: account.provider,
      accountId: account.id,
      title: file.name.replace(/\.[^.]+$/, ""),
      artist: "",
      album: "",
      duration: 0,
      format: parseAudioFormat(file),
      bitrate: 0,
      size: file.size,
      path: file.path || `/${file.name}`,
      albumArtId: file.thumbnailLink ? file.id : undefined,
      albumArtUrl: file.thumbnailLink,
      lastScanned: new Date(),
    }));

    await db.insert(tracks)
      .values(insertBatch)
      .onConflictDoUpdate({
        target: tracks.id,
        set: {
          size: sql`excluded.size`,
          lastScanned: sql`excluded.last_scanned`,
          albumArtUrl: sql`excluded.album_art_url`,
        },
      });

    newCount += insertBatch.length;
  }

  return NextResponse.json({
    provider: account.provider,
    totalFiles: audioFiles.length,
    newFiles: newCount,
    status: "complete",
  });
}
