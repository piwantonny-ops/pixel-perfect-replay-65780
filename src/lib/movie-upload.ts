export const MOVIE_WORKER_URL = "https://vjemma-upload.piwantonny.workers.dev";

export function movieUploadUrl(fileName: string, id: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${MOVIE_WORKER_URL}/${encodeURIComponent(`${id}-${safeName}`)}`;
}

export function uploadedVideoUrl(response: string): string {
  const result: unknown = JSON.parse(response);
  if (!result || typeof result !== "object" || !("success" in result) || result.success !== true || !("url" in result) || typeof result.url !== "string") {
    throw new Error("The upload service did not return a video URL.");
  }
  const url = new URL(result.url);
  if (url.protocol !== "https:") throw new Error("The video URL must use HTTPS.");
  return url.href;
}

/** Streams the original File directly; no base64, form wrapper or app-server body limit. */
export function uploadMovie(file: File, onProgress: (percent: number) => void, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    signal.addEventListener("abort", abort, { once: true });
    xhr.open("PUT", movieUploadUrl(file.name, crypto.randomUUID()));
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
    xhr.timeout = 0;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.floor(event.loaded / event.total * 100));
    };
    const cleanup = () => signal.removeEventListener("abort", abort);
    xhr.onload = () => {
      cleanup();
      if (xhr.status === 413) { reject(new Error("Cloudflare rejected this file’s size. Your Worker needs multipart uploads for larger movies.")); return; }
      if (xhr.status === 401 || xhr.status === 403) { reject(new Error("The deployed Worker requires upload authorization. Update it to match the code you provided.")); return; }
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(`Upload failed (${xhr.status}). Please try again.`)); return; }
      try { resolve(uploadedVideoUrl(xhr.responseText)); } catch (error) { reject(error); }
    };
    xhr.onerror = () => { cleanup(); reject(new Error("Upload connection failed. Check the Worker’s CORS settings and your internet connection.")); };
    xhr.onabort = () => { cleanup(); reject(new Error("Upload cancelled.")); };
    if (signal.aborted) { cleanup(); reject(new Error("Upload cancelled.")); return; }
    xhr.send(file);
  });
}