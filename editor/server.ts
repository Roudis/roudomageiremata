/**
 * The recipe editor's local server, started by `npm run editor` through
 * index.mjs. It serves the editor page from editor/ui and a small JSON API that
 * reads and writes the files the site builds from: data/recipes/<id>.json and
 * public/images/recipes/<id>.jpg. Every save is checked with the site's own
 * rules (recipe-input.ts), so nothing invalid is written.
 *
 * It listens on 127.0.0.1 only, and refuses requests from other sites, since
 * anything that can reach it can write to the repository.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALE_DETAILS, TRANSLATED_LOCALES, isTranslatedLocale } from "@/lib/i18n/config";
import { isRecipeId, parseCategoryTranslations } from "@/lib/recipe-schema";
import { categoryLabel } from "@/lib/recipe-view";
import { NOT_VEGETARIAN, TAG_IDS, TAG_IMPLIES, TAG_NAMES } from "@/lib/tags";
import { buildRecipe, dropBrokenTranslations, greekTextChanged, readForm, recipeIssues } from "./recipe-input";

type Json = Record<string, unknown>;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECIPES_DIR = path.join(ROOT, "data", "recipes");
const CATEGORIES_FILE = path.join(ROOT, "data", "categories.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images", "recipes");
const UI_DIR = path.join(ROOT, "editor", "ui");

const PORT = Number(process.env.EDITOR_PORT ?? 3210);
const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const ORIGINS = [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`];

/** The photo arrives as a JPEG the page has already resized, so this is generous. */
const MAX_BODY_BYTES = 30 * 1024 * 1024;

const UI_FILES: Record<string, { file: string; type: string }> = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
  "/slug.js": { file: "slug.js", type: "text/javascript; charset=utf-8" },
  "/styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
};
const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── Files ──────────────────────────────────────────────────────────────────

interface RecipeFile {
  id: string;
  raw: string;
  /** The parsed JSON, or undefined when the file isn't JSON. */
  value: Json | undefined;
  /** A short hash of the file, so a save can tell whether it changed on disk since the page loaded it. */
  version: string;
  jsonError?: string;
}

const versionOf = (raw: string | Buffer) => createHash("sha1").update(raw).digest("hex").slice(0, 16);

async function readRecipeFile(id: string): Promise<RecipeFile | undefined> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(RECIPES_DIR, `${id}.json`), "utf8");
  } catch (error) {
    if (isMissing(error)) return undefined;
    throw error;
  }
  try {
    const value: unknown = JSON.parse(raw);
    return { id, raw, value: isObject(value) ? value : {}, version: versionOf(raw) };
  } catch (error) {
    return { id, raw, value: undefined, version: versionOf(raw), jsonError: `invalid JSON: ${(error as Error).message}` };
  }
}

async function readRecipeFiles(): Promise<RecipeFile[]> {
  const names = (await fs.readdir(RECIPES_DIR)).filter((name) => name.endsWith(".json")).sort();
  const files = await Promise.all(names.map((name) => readRecipeFile(name.slice(0, -".json".length))));
  return files.filter((file): file is RecipeFile => file !== undefined);
}

async function readCategoryNames(): Promise<Json> {
  try {
    return parseCategoryTranslations(JSON.parse(await fs.readFile(CATEGORIES_FILE, "utf8")), "data/categories.json");
  } catch {
    // A missing or broken file means every chapter shows its Greek name; validate:data reports a broken one.
    return {};
  }
}

const isMissing = (error: unknown) => error instanceof Error && "code" in error && error.code === "ENOENT";

/** The file behind a root-relative public URL such as "/images/recipes/x.jpg", or undefined if it points outside public/. */
function publicFile(url: string): string | undefined {
  const file = path.resolve(PUBLIC_DIR, `.${url}`);
  return file.startsWith(PUBLIC_DIR + path.sep) ? file : undefined;
}

async function exists(file: string | undefined): Promise<boolean> {
  if (file === undefined) return false;
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** Writes through a temporary file and a rename, so an interrupted save never leaves half a file. */
async function writeAtomically(file: string, content: string | Buffer): Promise<void> {
  const temporary = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temporary, content);
  await fs.rename(temporary, file);
}

// ── API ────────────────────────────────────────────────────────────────────

/** What the page needs to start: every recipe for the list, and the choices for the form. */
async function state(): Promise<Json> {
  const files = await readRecipeFiles();
  const ids = new Set(files.map((file) => file.id));
  const categoryNames = await readCategoryNames();

  const recipes = await Promise.all(
    files.map(async (file) => {
      const recipe = file.value ?? {};
      const problems = file.jsonError
        ? [file.jsonError]
        : recipeIssues(recipe, file.id, ids).map((issue) => issue.message);
      if (typeof recipe.imageUrl === "string" && !(await exists(publicFile(recipe.imageUrl)))) {
        problems.push(`the photo ${recipe.imageUrl} is missing from public/`);
      }
      const memory = isObject(recipe.memory) ? recipe.memory : undefined;
      return {
        id: file.id,
        title: typeof recipe.title === "string" ? recipe.title : file.id,
        category: typeof recipe.category === "string" ? recipe.category : undefined,
        imageUrl: typeof recipe.imageUrl === "string" ? recipe.imageUrl : undefined,
        storyTitle: typeof memory?.title === "string" ? memory.title : undefined,
        hasStory: memory !== undefined,
        updatedAt: typeof recipe.updatedAt === "string" ? recipe.updatedAt : "",
        version: file.version,
        problems,
      };
    }),
  );
  recipes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title, "el"));

  const categories = new Set(Object.keys(categoryNames));
  for (const file of files) if (typeof file.value?.category === "string") categories.add(file.value.category);

  return {
    recipes,
    categories: Array.from(categories).sort((a, b) => a.localeCompare(b, "el")),
    translatedCategories: Object.keys(categoryNames),
    tags: TAG_IDS.map((id) => ({ id, name: TAG_NAMES[id].el, implies: TAG_IMPLIES[id] ?? [] })),
    notVegetarian: NOT_VEGETARIAN,
    languages: Object.fromEntries(TRANSLATED_LOCALES.map((locale) => [locale, LOCALE_DETAILS[locale].name])),
    siteUrl: SITE_URL,
  };
}

async function getRecipe(id: string): Promise<Json> {
  const file = isRecipeId(id) ? await readRecipeFile(id) : undefined;
  if (file === undefined) throw new HttpError(404, `There is no recipe "${id}".`);
  if (file.value === undefined) {
    throw new HttpError(422, `data/recipes/${id}.json can't be opened here: ${file.jsonError}. Fix it in a text editor.`);
  }
  const translations = isObject(file.value.translations) ? Object.keys(file.value.translations) : [];
  return { recipe: file.value, version: file.version, translations };
}

const languageName = (locale: string) => (isTranslatedLocale(locale) ? LOCALE_DETAILS[locale].name : locale);

/** The photo from the page: a JPEG data URL, as the page's resizing produces. */
function decodePhoto(dataUrl: string): Buffer {
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+=*)$/.exec(dataUrl);
  const bytes = match ? Buffer.from(match[1], "base64") : undefined;
  if (bytes === undefined || bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    throw new HttpError(400, "The photo didn't arrive as a JPEG. Try choosing it again.");
  }
  return bytes;
}

/**
 * Creates or updates a recipe from the page's form. When the recipe would not
 * pass `npm run validate:data`, writes nothing and returns the problems. An
 * update must carry the `version` the page loaded, so edits never overwrite a
 * file that changed on disk in the meantime.
 */
async function saveRecipe(id: string, body: Json, mode: "create" | "update"): Promise<[number, Json]> {
  if (!isRecipeId(id)) {
    throw new HttpError(
      400,
      `"${id}" can't be an id: use lowercase Latin letters, digits, and single hyphens, like "o-mousakas-tis-giagias".`,
    );
  }

  const files = await readRecipeFiles();
  const current = files.find((file) => file.id === id);
  if (mode === "create" && current !== undefined) {
    throw new HttpError(409, `There is already a recipe with the id "${id}". Choose another id, or open that recipe from the list.`);
  }
  if (mode === "update") {
    if (current === undefined) throw new HttpError(404, `data/recipes/${id}.json no longer exists.`);
    if (body.version !== current.version) {
      return [
        409,
        {
          error: `data/recipes/${id}.json changed on disk after you opened it, perhaps from a sync or a Git checkout. Reload it to see the current version; saving now would overwrite that.`,
          conflict: true,
        },
      ];
    }
    if (current.value === undefined) throw new HttpError(422, `data/recipes/${id}.json isn't valid JSON; fix it in a text editor.`);
  }

  const existing = current?.value;
  const photo = typeof body.image === "string" ? decodePhoto(body.image) : undefined;
  const previousImageUrl = typeof existing?.imageUrl === "string" ? existing.imageUrl : undefined;
  const imageUrl = photo ? `/images/recipes/${id}.jpg` : body.removeImage === true ? undefined : previousImageUrl;

  const otherIds = new Set(files.map((file) => file.id).filter((other) => other !== id));
  let recipe = buildRecipe(readForm(body.form), { id, existing, imageUrl, now: new Date() });
  let issues = recipeIssues(recipe, id, otherIds);
  let dropped: string[] = [];
  if (body.dropBrokenTranslations === true) {
    ({ recipe, dropped } = dropBrokenTranslations(recipe, issues));
    if (dropped.length > 0) issues = recipeIssues(recipe, id, otherIds);
  }
  if (photo === undefined && imageUrl !== undefined && !(await exists(publicFile(imageUrl)))) {
    issues.push({ field: "imageUrl", message: `The photo ${imageUrl} is missing from public/. Choose a photo, or remove it.` });
  }
  if (issues.length > 0) return [422, { issues }];

  // The photo first, so the recipe file never points to a photo that isn't there.
  if (photo) await writeAtomically(path.join(IMAGES_DIR, `${id}.jpg`), photo);
  const json = JSON.stringify(recipe, null, 2) + (current?.raw.endsWith("\n") ? "\n" : "");
  await writeAtomically(path.join(RECIPES_DIR, `${id}.json`), json);

  // A replaced or removed photo goes too, unless another recipe uses the same file.
  const others = files.filter((file) => file.id !== id);
  if (
    previousImageUrl?.startsWith("/images/recipes/") &&
    previousImageUrl !== imageUrl &&
    !others.some((file) => file.value?.imageUrl === previousImageUrl)
  ) {
    const file = publicFile(previousImageUrl);
    if (file !== undefined) await fs.rm(file, { force: true });
  }

  console.log(`✎ ${mode === "create" ? "created" : "saved"} data/recipes/${id}.json${photo ? ` and public${imageUrl}` : ""}`);
  return [200, { id, version: versionOf(json), warnings: await saveWarnings(recipe, existing, dropped, others) }];
}

/** Things worth knowing after a save that don't stop it. */
async function saveWarnings(recipe: Json, existing: Json | undefined, dropped: string[], others: RecipeFile[]): Promise<string[]> {
  const warnings: string[] = [];
  if (dropped.length > 0) {
    warnings.push(
      `Removed the translations in ${dropped.map(languageName).join(", ")}. Those languages show the Greek text with a notice until it is translated again.`,
    );
  }

  const translations = isObject(recipe.translations) ? Object.keys(recipe.translations) : [];
  if (existing !== undefined && translations.length > 0 && greekTextChanged(existing, recipe)) {
    warnings.push(
      `This recipe is also translated into ${translations.length} ${translations.length === 1 ? "language" : "languages"}, which the editor doesn't change. You changed the Greek text, so update the translations if the meaning changed.`,
    );
  }

  const categoryNames = await readCategoryNames();
  const category = typeof recipe.category === "string" ? recipe.category : undefined;
  if (category !== undefined && !Object.hasOwn(categoryNames, category)) {
    warnings.push(
      `“${category}” is a chapter with no translated names yet, so the other languages show it in Greek. Add its names to data/categories.json when you can.`,
    );
  }

  // validate:data fails on a name in data/categories.json that no recipe uses, as after moving a chapter's last recipe.
  const used = new Set([categoryLabel(recipe), ...others.map((file) => categoryLabel(file.value ?? {}))]);
  for (const unused of Object.keys(categoryNames).filter((name) => !used.has(name))) {
    warnings.push(
      `No recipe is in the chapter “${unused}” any more, but data/categories.json still names it. npm run validate:data fails until that entry is renamed or removed.`,
    );
  }
  return warnings;
}

// ── HTTP ───────────────────────────────────────────────────────────────────

function send(res: ServerResponse, status: number, body: Json): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function sendFile(res: ServerResponse, file: string, type: string): Promise<void> {
  let content: Buffer;
  try {
    content = await fs.readFile(file);
  } catch (error) {
    if (!isMissing(error)) throw error;
    throw new HttpError(404, "Not found.");
  }
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(content);
}

async function readJsonBody(req: IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "That is too much to save at once; try a smaller photo.");
    chunks.push(chunk as Buffer);
  }
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (isObject(body)) return body;
  } catch {
    // Reported below.
  }
  throw new HttpError(400, "The request wasn't valid JSON.");
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // A page on another site, or a DNS name pointed at 127.0.0.1, must not be able to write files.
  const host = req.headers.host ?? "";
  if (!ORIGINS.includes(`http://${host}`)) throw new HttpError(403, "Open the editor at http://127.0.0.1:" + PORT);
  const method = req.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    if (req.headers.origin !== undefined && !ORIGINS.includes(req.headers.origin)) throw new HttpError(403, "Forbidden.");
    if (!req.headers["content-type"]?.startsWith("application/json")) throw new HttpError(415, "Send JSON.");
  }

  const { pathname } = new URL(req.url ?? "/", `http://${host}`);
  const recipeRoute = /^\/api\/recipes\/([^/]+)$/.exec(pathname);
  const imageRoute = /^\/images\/recipes\/([a-z0-9][a-z0-9-]*\.[a-z]+)$/.exec(pathname);

  if (method === "GET" && Object.hasOwn(UI_FILES, pathname)) {
    const { file, type } = UI_FILES[pathname];
    return sendFile(res, path.join(UI_DIR, file), type);
  }
  if (method === "GET" && imageRoute) {
    const type = IMAGE_TYPES[path.extname(imageRoute[1])];
    if (type === undefined) throw new HttpError(404, "Not found.");
    return sendFile(res, path.join(IMAGES_DIR, imageRoute[1]), type);
  }
  if (method === "GET" && pathname === "/api/state") return send(res, 200, await state());
  if (method === "GET" && recipeRoute) return send(res, 200, await getRecipe(decodeURIComponent(recipeRoute[1])));
  if (method === "POST" && pathname === "/api/recipes") {
    const body = await readJsonBody(req);
    return send(res, ...(await saveRecipe(typeof body.id === "string" ? body.id : "", body, "create")));
  }
  if (method === "PUT" && recipeRoute) {
    return send(res, ...(await saveRecipe(decodeURIComponent(recipeRoute[1]), await readJsonBody(req), "update")));
  }
  throw new HttpError(404, "Not found.");
}

const server = createServer((req, res) => {
  handle(req, res).catch((error: unknown) => {
    if (error instanceof HttpError) return send(res, error.status, { error: error.message });
    console.error(error);
    send(res, 500, { error: "Something went wrong in the editor; the terminal running it shows what." });
  });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `✖ Port ${PORT} is in use. Is the editor already running? Start it on another port with EDITOR_PORT=3211 npm run editor.`
      : `✖ ${error.message}`,
  );
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`\n  Recipe editor: ${url}\n`);
  console.log("  Saves go to data/recipes/ and public/images/recipes/. Press Ctrl+C to stop.\n");
  if (!process.argv.includes("--no-open") && !process.env.CI) openBrowser(url);
});

function openBrowser(url: string): void {
  const [command, ...args] =
    process.platform === "darwin" ? ["open", url] : process.platform === "win32" ? ["cmd", "/c", "start", "", url] : ["xdg-open", url];
  try {
    spawn(command, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
  } catch {
    // Opening the browser is a convenience; the address is printed above.
  }
}
