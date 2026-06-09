import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/cloud-adapters";
import type { CloudProvider } from "@/types";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const fileId = req.nextUrl.searchParams.get("fileId");
  const accountId = req.headers.get("x-account-id");

  if (!fileId || !accountId) {
    return NextResponse.json({ error: "Missing fileId or accountId" }, { status: 400 });
  }

  const db = getDb();
  const account = await db.query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const adapter = getAdapter(provider as CloudProvider);

  let token = account.accessToken;
  if (Date.now() >= account.tokenExpiresAt) {
    const refreshed = await adapter.refreshToken(account.refreshToken);
    token = refreshed.accessToken;
    await db.update(accounts).set({
      accessToken: refreshed.accessToken,
      tokenExpiresAt: refreshed.expiresAt,
    }).where(eq(accounts.id, account.id));
  }

  const streamUrl = await adapter.streamUrl(token, fileId);

  const upstream = await fetch(streamUrl, { redirect: "follow" });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
  const contentLength = upstream.headers.get("content-length");
  const range = req.headers.get("range");

  if (range) {
    const rangeRes = await fetch(streamUrl, {
      headers: { Range: range },
    });

    if (rangeRes.status === 206) {
      return new NextResponse(rangeRes.body, {
        status: 206,
        headers: {
          "content-type": contentType,
          "content-range": rangeRes.headers.get("content-range")!,
          "content-length": rangeRes.headers.get("content-length")!,
          "accept-ranges": "bytes",
          "cache-control": "public, max-age=3600",
        },
      });
    }
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": contentType,
      ...(contentLength ? { "content-length": contentLength } : {}),
      "accept-ranges": "bytes",
      "cache-control": "public, max-age=3600",
    },
  });
}
