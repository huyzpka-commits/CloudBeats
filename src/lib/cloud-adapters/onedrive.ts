import type { CloudAdapter, CloudFile } from ".";
import type { CloudProvider } from "@/types";

const GRAPH_API = "https://graph.microsoft.com/v1.0";

export class OneDriveAdapter implements CloudAdapter {
  provider: CloudProvider = "onedrive";

  async listFiles(accessToken: string, parentId?: string): Promise<CloudFile[]> {
    const endpoint = parentId
      ? `${GRAPH_API}/me/drive/items/${parentId}/children`
      : `${GRAPH_API}/me/drive/root/children`;

    const allFiles: CloudFile[] = [];
    let url: string | null = `${endpoint}?$top=999&$select=id,name,file,parentReference,lastModifiedDateTime,size`;

    while (url) {
      const response: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error(`OneDrive API error: ${response.status}`);

      const data: { value: Record<string, unknown>[]; "@odata.nextLink"?: string } = await response.json();
      allFiles.push(...data.value.map((f: Record<string, unknown>) => this.toCloudFile(f)));
      url = data["@odata.nextLink"] ?? null;
    }

    return allFiles;
  }

  async streamUrl(accessToken: string, fileId: string): Promise<string> {
    return `${GRAPH_API}/me/drive/items/${fileId}/content?access_token=${accessToken}`;
  }

  async getDownloadUrl(accessToken: string, fileId: string): Promise<string> {
    const res = await fetch(
      `${GRAPH_API}/me/drive/items/${fileId}?select=@microsoft.graph.downloadUrl`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) throw new Error(`OneDrive download URL error: ${res.status}`);
    const data = await res.json();
    return data["@microsoft.graph.downloadUrl"];
  }

  async search(accessToken: string, query: string): Promise<CloudFile[]> {
    const res = await fetch(
      `${GRAPH_API}/me/drive/search(q='${encodeURIComponent(query)}')?$top=100&$select=id,name,file,parentReference,lastModifiedDateTime,size`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) throw new Error(`OneDrive search error: ${res.status}`);

    const data = await res.json();
    return data.value.map((f: Record<string, unknown>) => this.toCloudFile(f));
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const res = await fetch(
      `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.ONEDRIVE_CLIENT_ID!,
          client_secret: process.env.ONEDRIVE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "offline_access Files.Read.All",
        }),
      }
    );

    if (!res.ok) throw new Error(`OneDrive token refresh failed: ${res.status}`);

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
      provider: "onedrive",
      name: f.name as string,
      mimeType: (f.file as Record<string, unknown>)?.mimeType as string ?? "application/octet-stream",
      size: Number(f.size ?? 0),
      parentId: (f.parentReference as Record<string, unknown>)?.id as string ?? "root",
      path: (f.parentReference as Record<string, unknown>)?.path as string ?? "",
      modifiedTime: f.lastModifiedDateTime as string,
    };
  }
}
