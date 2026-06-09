import type { CloudAdapter, CloudFile } from ".";
import type { CloudProvider } from "@/types";

const DROPBOX_API = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_API = "https://content.dropboxapi.com/2";

export class DropboxAdapter implements CloudAdapter {
  provider: CloudProvider = "dropbox";

  async listFiles(accessToken: string, parentId?: string): Promise<CloudFile[]> {
    const res = await fetch(`${DROPBOX_API}/files/list_folder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: parentId ?? "",
        recursive: true,
        include_media_info: false,
        limit: 2000,
      }),
    });

    if (!res.ok) throw new Error(`Dropbox API error: ${res.status}`);

    const data = await res.json();
    let entries = data.entries;

    while (data.has_more) {
      const cursorRes = await fetch(`${DROPBOX_API}/files/list_folder/continue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursor: data.cursor }),
      });

      if (!cursorRes.ok) break;
      const cursorData = await cursorRes.json();
      entries = entries.concat(cursorData.entries);
      data.has_more = cursorData.has_more;
      data.cursor = cursorData.cursor;
    }

    return entries
      .filter((e: Record<string, unknown>) => e[".tag"] === "file")
      .map((e: Record<string, unknown>) => this.toCloudFile(e, accessToken));
  }

  async streamUrl(accessToken: string, fileId: string): Promise<string> {
    return `${DROPBOX_CONTENT_API}/files/download?arg=${encodeURIComponent(
      JSON.stringify({ path: fileId })
    )}&access_token=${accessToken}`;
  }

  async getTempLink(accessToken: string, path: string): Promise<string> {
    const res = await fetch(`${DROPBOX_API}/files/get_temporary_link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });

    if (!res.ok) throw new Error(`Dropbox temp link error: ${res.status}`);
    const data = await res.json();
    return data.link;
  }

  async search(accessToken: string, query: string): Promise<CloudFile[]> {
    const res = await fetch(`${DROPBOX_API}/files/search_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        options: { file_status: "active", filename_only: true, max_results: 100 },
      }),
    });

    if (!res.ok) throw new Error(`Dropbox search error: ${res.status}`);

    const data = await res.json();
    return data.matches
      .filter((m: Record<string, unknown>) => m.metadata?.metadata?.[".tag"] === "file")
      .map((m: Record<string, unknown>) => this.toCloudFile(m.metadata.metadata, accessToken));
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DROPBOX_CLIENT_ID!,
        client_secret: process.env.DROPBOX_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error(`Dropbox token refresh failed: ${res.status}`);

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  private toCloudFile(e: Record<string, unknown>, _token: string): CloudFile {
    return {
      id: e.id as string,
      provider: "dropbox",
      name: e.name as string,
      mimeType: (e.client_modified as string) ?? "application/octet-stream",
      size: Number(e.size ?? 0),
      parentId: (e.path_display as string)?.split("/").slice(-2)[0] ?? "",
      path: e.path_display as string,
      modifiedTime: e.client_modified as string,
    };
  }
}
