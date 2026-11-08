import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMovie } from "@/lib/movie-upload";

export function MovieUpload({ onUploaded, onBusy }: { onUploaded: (url: string) => Promise<void>; onBusy: (busy: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const start = async () => {
    if (!file) return;
    setError(""); onBusy(true);
    try {
      let url = videoUrl;
      if (!url) {
        setPhase("uploading"); setProgress(0);
        const abort = new AbortController(); controller.current = abort;
        url = await uploadMovie(file, setProgress, abort.signal);
        setVideoUrl(url);
      }
      setPhase("saving");
      await onUploaded(url);
      setPhase("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); setPhase("error"); }
    finally { onBusy(false); controller.current = null; }
  };
  const busy = phase === "uploading" || phase === "saving";
  return <div className="space-y-3 border-t border-border pt-3 sm:col-span-2">
    <Label htmlFor="movie-file">Upload movie video</Label>
    <Input id="movie-file" type="file" accept="video/*,.mkv,.mov,.mp4,.webm" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setVideoUrl(""); setPhase("idle"); setError(""); }} />
    {file && <p className="break-all text-sm text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
    {busy && <div className="space-y-1" role="status" aria-live="polite">
      <p className="text-sm">{phase === "saving" ? "Saving movie…" : progress === 100 ? "100% — waiting for upload confirmation…" : `Uploading ${progress}%`}</p>
      <progress aria-label="Movie upload progress" value={progress} max={100} className="h-2 w-full accent-primary" />
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {phase === "done" && <p className="text-sm text-success">Movie uploaded and saved.</p>}
    <div className="flex flex-wrap gap-2">
      <Button variant="hero" disabled={!file || busy || phase === "done"} onClick={start}><Upload />{videoUrl ? "Retry saving movie" : "Upload & save movie"}</Button>
      {phase === "uploading" && <Button variant="ghost" onClick={() => controller.current?.abort()}><X />Cancel upload</Button>}
    </div>
  </div>;
}