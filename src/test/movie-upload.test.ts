import { describe, expect, it } from "vitest";
import { movieUploadUrl, uploadedVideoUrl } from "@/lib/movie-upload";

describe("Worker upload contract", () => {
  it("uses the user's Worker plus a unique filename", () => {
    expect(movieUploadUrl("Luo Movie.mp4", "unique")).toBe("https://vjemma-upload.piwantonny.workers.dev/unique-Luo-Movie.mp4");
  });
  it("uses the returned video URL after confirmed success", () => {
    expect(uploadedVideoUrl('{"success":true,"url":"https://vjemma-upload.piwantonny.workers.dev/movie.mp4","fileName":"movie.mp4"}')).toBe("https://vjemma-upload.piwantonny.workers.dev/movie.mp4");
  });
  it("does not publish an unsuccessful upload", () => {
    expect(() => uploadedVideoUrl('{"success":false,"url":"https://vjemma-upload.piwantonny.workers.dev/movie.mp4"}')).toThrow();
  });
});