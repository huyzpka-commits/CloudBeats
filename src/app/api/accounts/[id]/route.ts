import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { accounts, tracks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    // Delete tracks first (foreign key constraint)
    await db.delete(tracks).where(eq(tracks.accountId, id));
    await db.delete(accounts).where(eq(accounts.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Failed to delete account:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
