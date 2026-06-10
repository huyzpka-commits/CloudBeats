import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema/index";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";

function getDbDir(): string {
  const envDir = process.env.DATABASE_DIR;
  if (envDir) return envDir;

  const cwdData = path.join(process.cwd(), "data");
  try {
    fs.accessSync(cwdData, fs.constants.W_OK);
    return cwdData;
  } catch {
    // fallback to /tmp for Railway free tier (no persistent volume)
    return "/tmp/data";
  }
}

const DB_DIR = getDbDir();
const DB_PATH = path.join(DB_DIR, "cloudbeats.db");

type DB = BetterSQLite3Database<typeof schema>;

let _db: DB | null = null;

export function getDb(): DB {
  if (_db) return _db;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("synchronous = NORMAL");
    sqlite.pragma("cache_size = -64000");

    _db = drizzle(sqlite, { schema });
    console.log(`[DB] Connected to ${DB_PATH}`);
    return _db;
  } catch (err) {
    console.error(`[DB] Failed to connect to ${DB_PATH}:`, err);
    throw err;
  }
}
