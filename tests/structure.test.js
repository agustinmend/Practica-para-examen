import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

describe("Project setup", () => {
  it("has TypeScript installed", () => {
    const deps = { ...(pkg.devDependencies ?? {}), ...(pkg.dependencies ?? {}) };
    expect(deps.typescript, "typescript debe estar instalado").toBeDefined();
  });

  it("has Handlebars installed", () => {
    const deps = { ...(pkg.devDependencies ?? {}), ...(pkg.dependencies ?? {}) };
    expect(deps.handlebars, "handlebars debe estar instalado").toBeDefined();
  });

  it("has PostCSS installed", () => {
    const deps = { ...(pkg.devDependencies ?? {}), ...(pkg.dependencies ?? {}) };
    expect(deps.postcss, "postcss debe estar instalado").toBeDefined();
  });

  it("has tsconfig.json", () => {
    expect(existsSync(join(root, "tsconfig.json"))).toBe(true);
  });

  it("tsconfig.json enables strict mode", () => {
    const tsconfigPath = join(root, "tsconfig.json");
    if (!existsSync(tsconfigPath)) return;
    const raw = readFileSync(tsconfigPath, "utf8");
    // Strip // and /* */ comments so JSON.parse handles typical tsconfig files.
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
    let cfg;
    try {
      cfg = JSON.parse(stripped);
    } catch {
      throw new Error("tsconfig.json no es JSON válido");
    }
    const strict = cfg?.compilerOptions?.strict;
    expect(strict, "tsconfig.json debe tener compilerOptions.strict = true").toBe(true);
  });

  it("has a postcss config", () => {
    const candidates = ["postcss.config.js", "postcss.config.cjs", "postcss.config.ts", "postcss.config.mjs"];
    expect(candidates.some((f) => existsSync(join(root, f)))).toBe(true);
  });

  it("declares dev, build and start scripts", () => {
    expect(pkg.scripts?.dev, "script 'dev' faltante").toBeTruthy();
    expect(pkg.scripts?.build, "script 'build' faltante").toBeTruthy();
    expect(pkg.scripts?.start, "script 'start' faltante").toBeTruthy();
  });

  it("dev script targets port 3000", () => {
    const all = `${pkg.scripts?.dev ?? ""} ${pkg.scripts?.start ?? ""}`;
    expect(/3000/.test(all), "el servidor debe correr en el puerto 3000").toBe(true);
  });
});

describe("Source organization (MVC)", () => {
  it("has a src/ folder", () => {
    expect(existsSync(join(root, "src"))).toBe(true);
  });

  const srcFiles = walk(join(root, "src"));

  it("uses TypeScript (.ts) files in src/", () => {
    const tsFiles = srcFiles.filter((f) => f.endsWith(".ts"));
    expect(tsFiles.length, "deben existir archivos .ts en src/").toBeGreaterThan(0);
  });

  it("does NOT keep legacy .js source files in src/", () => {
    const jsInSrc = srcFiles.filter((f) => f.endsWith(".js"));
    expect(jsInSrc, "src/ no debe contener archivos .js (refactoriza a .ts)").toEqual([]);
  });

  it("separates concerns into models, views, and controllers", () => {
    const lower = srcFiles.map((f) => f.toLowerCase());
    const hasModels = lower.some((f) => /\/(models?)\//.test(f));
    const hasViews = lower.some((f) => /\/(views?|components?|pages?|templates?)\//.test(f));
    const hasControllers = lower.some((f) => /\/(controllers?)\//.test(f));
    expect(hasModels, "falta carpeta models/").toBe(true);
    expect(hasViews, "falta carpeta views/ o components/").toBe(true);
    expect(hasControllers, "falta carpeta controllers/").toBe(true);
  });

  it("uses Handlebars templates (.hbs) for the views", () => {
    const hbs = srcFiles.filter((f) => f.endsWith(".hbs"));
    expect(hbs.length, "deben existir templates .hbs").toBeGreaterThan(0);
  });

  it("exposes an api.ts to consume the mock data", () => {
    const api = srcFiles.some((f) => /\/api\.ts$/.test(f));
    expect(api, "src/api.ts es requerido").toBe(true);
  });

  it("ships a router using the History API", () => {
    const routerFile = srcFiles.find((f) => /router\.ts$/i.test(f));
    expect(routerFile, "src/router.ts es requerido").toBeTruthy();
    const content = readFileSync(routerFile, "utf8");
    expect(/pushState|replaceState/.test(content), "el router debe usar History API").toBe(true);
    expect(/popstate/.test(content), "el router debe escuchar 'popstate'").toBe(true);
  });
});

describe("Mock data", () => {
  it("keeps mock data in a nested JSON under mock/", () => {
    expect(existsSync(join(root, "mock"))).toBe(true);
    const jsons = walk(join(root, "mock")).filter((f) => f.endsWith(".json"));
    expect(jsons.length, "debe haber al menos un .json bajo mock/").toBeGreaterThan(0);
    const data = JSON.parse(readFileSync(jsons[0], "utf8"));
    expect(Array.isArray(data.channels), "channels debe ser un array").toBe(true);
    expect(data.channels[0].messages, "los canales deben tener messages anidados").toBeDefined();
  });
});
