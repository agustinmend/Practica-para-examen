import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(__dirname, "..");
const apiPath = join(root, "src", "api.ts");

describe("api.ts", () => {
  it("exists", () => {
    expect(existsSync(apiPath), "src/api.ts no encontrado").toBe(true);
  });

  it("references the mock data location", () => {
    if (!existsSync(apiPath)) return;
    const src = readFileSync(apiPath, "utf8");
    expect(/mock/.test(src), "api.ts debe consumir datos desde mock/").toBe(true);
  });

  it("consumes the mock JSON via fetch()", () => {
    if (!existsSync(apiPath)) return;
    const src = readFileSync(apiPath, "utf8");
    expect(
      /\bfetch\s*\(/.test(src),
      "api.ts debe llamar a fetch(...) para obtener los datos del mock",
    ).toBe(true);
  });

  it("exports functions to fetch channels and messages", () => {
    if (!existsSync(apiPath)) return;
    const src = readFileSync(apiPath, "utf8");
    expect(/export\s+(async\s+)?function\s+\w*[Cc]hannels?/.test(src) || /export\s+const\s+\w*[Cc]hannels?/.test(src)).toBe(true);
  });
});
