import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { RecipeDataError } from "@/lib/recipe-schema";

export interface JsonFile {
  /** The file's path relative to the working directory, for messages. */
  source: string;
  value: unknown;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
const isMissingFile = (error: unknown) => error instanceof Error && "code" in error && error.code === "ENOENT";

/**
 * Reads and parses one JSON data file for the loaders in lib/recipes.ts and
 * lib/categories.ts. Returns undefined when the file does not exist, and throws
 * a RecipeDataError naming the file when it cannot be read or is not JSON.
 * `kind` says what the file should hold, for that message.
 */
export async function readJsonFile(filePath: string, kind?: string): Promise<JsonFile | undefined> {
  const source = path.relative(process.cwd(), filePath);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (isMissingFile(error)) return undefined;
    throw new RecipeDataError(source, [{ field: "", message: `could not be read: ${errorMessage(error)}` }], kind);
  }

  try {
    return { source, value: JSON.parse(raw) };
  } catch (error) {
    throw new RecipeDataError(source, [{ field: "", message: `invalid JSON: ${errorMessage(error)}` }], kind);
  }
}
