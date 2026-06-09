import { parseBuffer } from "music-metadata-browser";

self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data;

  try {
    const buffer = await file.arrayBuffer();
    const metadata = await parseBuffer(new Uint8Array(buffer), file.name, {
      skipCovers: false,
    });

    const picture = metadata.common.picture?.[0];

    self.postMessage({
      title: metadata.common.title ?? file.name.replace(/\.[^.]+$/, ""),
      artist: metadata.common.artist ?? "",
      album: metadata.common.album ?? "",
      duration: metadata.format.duration ?? 0,
      bitrate: metadata.format.bitrate ?? 0,
      albumArt: picture?.data.buffer,
      albumArtMime: picture?.format,
    });
  } catch {
    self.postMessage({
      title: file.name.replace(/\.[^.]+$/, ""),
      artist: "",
      album: "",
      duration: 0,
      bitrate: 0,
    });
  }
};
