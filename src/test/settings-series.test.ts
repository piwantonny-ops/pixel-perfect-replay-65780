import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizePhone, restoreDB, saveSettings, seedDB, seriesEpisodes, seriesSummary, type Movie } from "@/lib/store";

describe("Settings persistence", () => {
  beforeEach(() => localStorage.clear());
  it("prefills the real WhatsApp contacts", () => {
    expect([normalizePhone(seedDB().settings.whatsapp), normalizePhone(seedDB().settings.whatsapp2)]).toEqual(["256776043203", "256779818746"]);
  });
  it("prefills the official TikTok link", () => {
    expect(seedDB().settings.tiktok).toBe("https://www.tiktok.com/@vjemmaoffical");
  });
  it("prefills the official YouTube link", () => {
    expect(seedDB().settings.youtube).toBe("https://youtube.com/@vjemmaofficial");
  });
  it("uses app version 1.0.4", () => {
    expect(seedDB().settings.appVersion).toBe("1.0.4");
  });
  it("upgrades old links without deleting existing movies", () => {
    const db = seedDB();
    const legacy = { ...db, contactLinksVersion: undefined, settings: { ...db.settings, whatsapp: "256700000000" }, movies: [{ ...db.movies[0], id: "existing" } as Movie] };
    const restored = restoreDB(legacy);
    expect(restored.settings.whatsapp).toBe("0776043203");
    expect(restored.movies.map((m) => m.id)).toEqual(["existing"]);
  });
  it("persists all settings and edited plans and keeps admin changes on reload", () => {
    const db = seedDB();
    const settings = { ...db.settings, whatsapp: "0779818746", appVersion: "1.0.5", tagline: "Changed" };
    const plans = db.plans.map((p) => p.id === "1-day" ? { ...p, price: 2500 } : p);
    saveSettings(settings, plans);
    const persisted = JSON.parse(localStorage.getItem("vjemma-db-v1") ?? "{}");
    const restored = restoreDB(persisted);
    expect(restored.settings).toEqual(settings);
    expect(restored.plans[0]?.price).toBe(2500);
  });
  it("does not claim a successful save when storage refuses the write", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Full"); });
    expect(() => saveSettings(seedDB().settings, seedDB().plans)).toThrow("Full");
    spy.mockRestore();
  });
});

describe("Series episodes", () => {
  const first = seedDB().movies[0];
  if (!first) throw new Error("Movie fixture required");
  const series: Movie = { ...first, type: "series", seasons: [{ id: "s1", number: 1, episodes: Array.from({ length: 12 }, (_, i) => ({ id: `e${i + 1}`, number: i + 1, title: `Episode ${i + 1}`, videoUrl: `https://example.com/${i + 1}.mp4`, duration: "20m", thumbnail: "" })) }] };
  it("reports season 1 and the actual 12 episodes", () => {
    expect(seriesSummary(series)).toBe("Series - Season 1 - 12 Episodes");
  });
  it("orders episodes for next episode playback across seasons", () => {
    const reversed: Movie = { ...series, seasons: [{ id: "s2", number: 2, episodes: [{ ...seriesEpisodes(series)[0], id: "s2e1", number: 1 }] }, { id: "s1", number: 1, episodes: [...(series.seasons?.[0]?.episodes ?? [])].reverse() }] };
    const list = seriesEpisodes(reversed);
    expect(list.map((e) => e.id)).toEqual([...Array.from({ length: 12 }, (_, i) => `e${i + 1}`), "s2e1"]);
    expect(list[1]?.videoUrl).toBe("https://example.com/2.mp4");
  });
});