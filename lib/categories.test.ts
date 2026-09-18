import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCategoryNames } from "@/lib/categories";

let dir: string;
let file: string;
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "categories-test-"));
  file = path.join(dir, "categories.json");
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(dir, { recursive: true, force: true });
});

const write = (value: unknown) => fs.writeFile(file, JSON.stringify(value), "utf8");

describe("getCategoryNames", () => {
  it("returns only the fallback category's name for Greek, whose names are the keys themselves", async () => {
    await write({ "Της Γιαγιάς": { en: "Grandma’s" } });

    expect(await getCategoryNames("el", file)).toEqual({ Άλλο: "Άλλο" });
  });

  it("returns the file's names for the language, plus the fallback category's", async () => {
    await write({ "Της Γιαγιάς": { en: "Grandma’s", fr: "De Mamie" }, "Του Μπαμπούλα": { fr: "De Baboulas" } });

    expect(await getCategoryNames("en", file)).toEqual({ Άλλο: "Other", "Της Γιαγιάς": "Grandma’s" });
    expect(await getCategoryNames("fr", file)).toEqual({
      Άλλο: "Autre",
      "Της Γιαγιάς": "De Mamie",
      "Του Μπαμπούλα": "De Baboulas",
    });
  });

  it("treats a missing file as no translations, without warning", async () => {
    expect(await getCategoryNames("en", path.join(dir, "missing.json"))).toEqual({ Άλλο: "Other" });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("ignores an invalid file with one warning naming the problem, so pages show Greek names", async () => {
    await write({ "Της Γιαγιάς": { de: "Omas" } });

    expect(await getCategoryNames("en", file)).toEqual({ Άλλο: "Other" });
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(String(warnSpy.mock.calls[0][0])).toContain('unknown language "de"');
  });

  it("ignores a file that is not JSON, with a warning", async () => {
    await fs.writeFile(file, "{ not json", "utf8");

    expect(await getCategoryNames("en", file)).toEqual({ Άλλο: "Other" });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("reads data/categories.json by default", async () => {
    const names = await getCategoryNames("en");

    expect(names["Οι ντελικάτες της Μαμάς"]).toBe("Mum’s delicate ones");
  });
});
