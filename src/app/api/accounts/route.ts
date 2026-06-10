import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { accounts } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getDb();
    const allAccounts = await db.select().from(accounts);
    return NextResponse.json(allAccounts);
  } catch (err) {
    console.error("[API] Failed to fetch accounts:", err);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
