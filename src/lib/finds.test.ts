import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FIND_TAGS, FINDS, isFindTag, submissionText, tagName, type Submission } from "./finds";

describe("Finds", () => {
  it("credits, links and pictures every published find (npm run finds:add)", () => {
    for (const f of FINDS) {
      expect(f.creator, f.slug).toBeTruthy();
      expect(f.url, f.slug).toMatch(/^https?:\/\//);
      expect(f.creatorUrl, f.slug).toMatch(/^https?:\/\//);
      expect(existsSync(path.join(process.cwd(), "public", f.image.src)), f.image.src).toBe(true);
      for (const t of f.tags) expect(isFindTag(t), `${f.slug}: ${t}`).toBe(true);
    }
    expect(new Set(FINDS.map((f) => f.slug)).size).toBe(FINDS.length);
  });

  it("names every tag in Arabic", () => {
    for (const t of FIND_TAGS) expect(tagName(t.slug, "ar")).toMatch(/[؀-ۿ]/);
    expect(isFindTag("motion")).toBe(true);
    expect(isFindTag("screenshots")).toBe(false);
  });

  it("hands the operator a publish command that survives quotes in a title", () => {
    const s: Submission = {
      ref: "FD-1",
      title: 'The "quiet" loader',
      creator: "Sara Q",
      email: "sara@example.com",
      creatorUrl: "https://sara.design",
      url: "https://dribbble.com/shots/1",
      imageUrl: "https://cdn.example.com/a.png",
      tags: ["motion", "3d"],
      note: "",
      receivedAt: "2026-10-28T00:00:00Z",
    };
    const text = submissionText(s);
    expect(text).toContain('npm run finds:add -- --title "The \\"quiet\\" loader" --creator "Sara Q"');
    expect(text).toContain("--tags motion,3d");
    expect(text).toContain("They confirmed they made it");
  });
});
