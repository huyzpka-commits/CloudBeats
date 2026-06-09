import type { CloudAdapter, CloudFile } from ".";
import type { CloudProvider } from "@/types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";

export class GoogleDriveAdapter implements CloudAdapter {
  provider: CloudProvider = "google";

  async listFiles(accessToken: string, parentId?: string): Promise<CloudFile[]> {
    const query = parentId
      ? `'${parentId}' in parents and trashed = false`
      : "trashed = false";

    const allFiles: CloudFile[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        q: query,
        fields: "nextPageToken,files(id,name,mimeType,size,parents,modifiedTime,thumbnailLink,webContentLink)",
        pageSize: "1000",
        orderBy: "name",
        ...(pageToken ? { pageToken } : {}),
      });

      const res = await fetch(`${DRIVE_API}/files?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Google Drive API error: ${res.status}`);

      const data = await res.json();
      allFiles.push(
        ...data.files.map((f: Record<string, unknown>) => this.toCloudFile(f))
      );
      pageToken = data.nextPageToken;
    } while (pageToken);

    return allFiles;
  }

  async streamUrl(accessToken: string, fileId: string): Promise<string> {
    return `${DRIVE_API}/files/${fileId}?alt=media&access_token=${accessToken}`;
  }

  async search(accessToken: string, query: string): Promise<CloudFile[]> {
    const params = new URLSearchParams({
      q: `fullText contains '${query}' and trashed = false`,
      fields: "files(id,name,mimeType,size,parents,modifiedTime,thumbnailLink,webContentLink)",
      pageSize: "100",
    });

    const res = await fetch(`${DRIVE_API}/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Google Drive search error: ${res.status}`);

    const data = await res.json();
    return data.files.map((f: Record<string, unknown>) => this.toCloudFile(f));
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  }

  private toCloudFile(f: Record<string, unknown>): CloudFile {
    return {
      id: f.id as string,
      provider: "google",
      name: f.name as string,
      mimeType: f.mimeType as string,
      size: Number(f.size ?? 0),
      parentId: (f.parents as string[])?.[0] ?? "root",
      path: "",
      modifiedTime: f.modifiedTime as string,
      thumbnailLink: f.thumbnailLink as string | undefined,
      webContentLink: f.webContentLink as string | undefined,
    };
  }
}
