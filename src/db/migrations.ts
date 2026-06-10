import Database from "better-sqlite3";

const MIGRATIONS = [
  // accounts table
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL CHECK(provider IN ('google', 'dropbox', 'onedrive')),
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'connected' CHECK(status IN ('connected', 'disconnected', 'expired')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,
  // tracks table
  `CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK(provider IN ('google', 'dropbox', 'onedrive')),
    account_id TEXT NOT NULL REFERENCES accounts(id),
    title TEXT NOT NULL,
    artist TEXT DEFAULT '',
    album TEXT DEFAULT '',
    duration REAL DEFAULT 0,
    format TEXT NOT NULL,
    bitrate INTEGER DEFAULT 0,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    album_art_id TEXT,
    album_art_url TEXT,
    last_scanned INTEGER NOT NULL DEFAULT (unixepoch())
  );`,
  // playlists table
  `CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    track_ids TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,
  // scan_log table
  `CREATE TABLE IF NOT EXISTS scan_log (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES accounts(id),
    provider TEXT NOT NULL CHECK(provider IN ('google', 'dropbox', 'onedrive')),
    total_files INTEGER DEFAULT 0,
    new_files INTEGER DEFAULT 0,
    removed_files INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('scanning', 'indexing', 'complete', 'error')),
    started_at INTEGER NOT NULL,
    completed_at INTEGER
  );`,
];

export function runMigrations(db: Database) {
  for (const sql of MIGRATIONS) {
    db.exec(sql);
  }
  console.log("[DB] Schema migrations applied");
}
