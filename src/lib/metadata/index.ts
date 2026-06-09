export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  bitrate: number;
  albumArt?: ArrayBuffer;
  albumArtMime?: string;
}

const WORKER_COUNT = navigator.hardwareConcurrency ?? 4;
let workerPool: Worker[] = [];
let taskQueue: Array<{
  file: File;
  resolve: (meta: AudioMetadata) => void;
  reject: (err: Error) => void;
}> = [];
let activeWorkers = 0;

function getWorker(): Worker | null {
  if (workerPool.length > 0) return workerPool.pop()!;
  if (activeWorkers < WORKER_COUNT) {
    activeWorkers++;
    return new Worker(new URL("./metadata-worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return null;
}

function drainQueue() {
  while (taskQueue.length > 0) {
    const worker = getWorker();
    if (!worker) break;

    const task = taskQueue.shift()!;

    worker.onmessage = (e: MessageEvent<AudioMetadata>) => {
      task.resolve(e.data);
      workerPool.push(worker);
      drainQueue();
    };

    worker.onerror = (err) => {
      task.reject(new Error(err.message));
      activeWorkers--;
      drainQueue();
    };

    worker.postMessage(task.file, [task.file]);
  }
}

export function extractMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    taskQueue.push({ file, resolve, reject });
    drainQueue();
  });
}

export function extractMetadataFallback(file: File): AudioMetadata {
  const name = file.name.replace(/\.[^.]+$/, "");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return {
    title: name,
    artist: "",
    album: "",
    duration: 0,
    bitrate: 0,
  };
}
