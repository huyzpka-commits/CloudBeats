import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema/index";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.DATABASE_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "cloudbeats.db");

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("cache_size = -64000");

  _db = drizzle(sqlite, { schema });
  return _db;
}
