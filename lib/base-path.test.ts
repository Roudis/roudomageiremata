import { afterEach, describe, expect, it, vi } from "vitest";
import { withBasePath } from "@/lib/base-path";

const IMAGE = "/images/recipes/gemista.jpg";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("withBasePath", () => {
  it("prefixes the path with NEXT_PUBLIC_BASE_PATH, as on GitHub Pages", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/roudomageiremata");

    expect(withBasePath(IMAGE)).toBe("/roudomageiremata/images/recipes/gemista.jpg");
  });

  it("returns the path unchanged when the base path is empty, as in local builds", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    expect(withBasePath(IMAGE)).toBe(IMAGE);
  });

  it("returns the path unchanged when the base path is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", undefined);

    expect(withBasePath(IMAGE)).toBe(IMAGE);
  });

  it("reads the base path on every call", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/first");
    const first = withBasePath(IMAGE);
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/second");

    expect(first).toBe("/first/images/recipes/gemista.jpg");
    expect(withBasePath(IMAGE)).toBe("/second/images/recipes/gemista.jpg");
  });

  it("joins the strings verbatim, without adding or removing slashes (current behavior)", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/roudomageiremata/");

    expect(withBasePath(IMAGE)).toBe("/roudomageiremata//images/recipes/gemista.jpg");
    expect(withBasePath("images/recipes/gemista.jpg")).toBe("/roudomageiremata/images/recipes/gemista.jpg");
  });
});
