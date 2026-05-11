import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..", "..");

describe("layout regressions", () => {
  it("does not keep the default Vite root width constraints", () => {
    const appCss = readFileSync(resolve(projectRoot, "src/App.css"), "utf8");

    expect(appCss).not.toContain("max-width: 1280px");
    expect(appCss).not.toContain("padding: 2rem");
    expect(appCss).not.toContain("text-align: center");
  });

  it("uses an adaptive ration card grid instead of fixed five columns", () => {
    const rationsSection = readFileSync(resolve(projectRoot, "src/sections/Rations.tsx"), "utf8");

    expect(rationsSection).toContain("repeat(auto-fit,minmax(280px,1fr))");
    expect(rationsSection).not.toContain("xl:grid-cols-5");
  });
});
