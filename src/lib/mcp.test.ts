import { describe, expect, it } from "vitest";
import { callTool } from "./mcp";

const text = async (tool: string, args: Record<string, unknown>) => {
  const r = await callTool(tool, args, "https://uiverse.test");
  return r.content.map((c) => ("text" in c ? c.text : "")).join("\n");
};

describe("MCP get_interface_spec", () => {
  it("names the source as attribution but describes a brand's own typeface instead of naming it", async () => {
    const md = await text("get_interface_spec", { slug: "x-tabby-ai-ar-sa" });
    expect(md).toContain("# Tabby"); // attribution header stays
    expect(md).not.toContain("Tabby Sans");
    expect(md).toContain("Headings: a custom brand typeface");
    expect(md).toContain("licensed to it alone");
  });

  it("only serves real captures", async () => {
    expect(await text("get_interface_spec", { slug: "s019-meridian-journal" })).toMatch(/no interface/i);
  });
});
