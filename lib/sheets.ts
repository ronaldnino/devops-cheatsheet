import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { SheetMeta } from "./types";

export type { SheetMeta };
export { CATEGORY_LABELS, LEVEL_COLORS } from "./types";

export interface Tip {
  type: "tip" | "warning" | "info" | "success";
  text: string;
}

export interface Sheet extends SheetMeta {
  content: string;
  tips?: Tip[];
}

const SHEETS_DIR = path.join(process.cwd(), "content/sheets");

export function getAllSheets(): SheetMeta[] {
  const files = fs.readdirSync(SHEETS_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(SHEETS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return data as SheetMeta;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getSheetBySlug(slug: string): Sheet | null {
  const filePath = path.join(SHEETS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as SheetMeta), content, tips: data.tips };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(SHEETS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}
