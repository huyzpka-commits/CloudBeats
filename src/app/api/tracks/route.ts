import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { tracks } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getDb();
    const allTracks = await db.select().from(tracks);
    return NextResponse.json(allTracks);
  } catch (err) {
    console.error("[API] Failed to fetch tracks:", err);
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
  }
}
