import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  provider: text("provider", { enum: ["google", "dropbox", "onedrive"] }).notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  tokenExpiresAt: integer("token_expires_at").notNull(),
  status: text("status", { enum: ["connected", "disconnected", "expired"] }).notNull().default("connected"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const tracks = sqliteTable("tracks", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull(),
  provider: text("provider", { enum: ["google", "dropbox", "onedrive"] }).notNull(),
  accountId: text("account_id").notNull().references(() => accounts.id),
  title: text("title").notNull(),
  artist: text("artist").default(""),
  album: text("album").default(""),
  duration: real("duration").default(0),
  format: text("format").notNull(),
  bitrate: integer("bitrate").default(0),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  albumArtId: text("album_art_id"),
  albumArtUrl: text("album_art_url"),
  lastScanned: integer("last_scanned", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const playlists = sqliteTable("playlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  trackIds: text("track_ids", { mode: "json" }).notNull().$type<string[]>().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const scanLog = sqliteTable("scan_log", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => accounts.id),
  provider: text("provider", { enum: ["google", "dropbox", "onedrive"] }).notNull(),
  totalFiles: integer("total_files").default(0),
  newFiles: integer("new_files").default(0),
  removedFiles: integer("removed_files").default(0),
  status: text("status", { enum: ["scanning", "indexing", "complete", "error"] }).notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
