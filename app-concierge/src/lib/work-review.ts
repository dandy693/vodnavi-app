/**
 * CCO 自動生成レビューのローダ — server-only。
 *
 * `app-concierge/src/data/work-reviews/{content_id}.md` に
 * frontmatter 付きで配置されたレビューを、作品詳細ページ (server component)
 * から型安全に参照する。
 *
 * 設計方針:
 *   - editorial.ts (CCO 手書きリード文) と **並列** に置く。editorial は
 *     200〜400 字の H1 直下リード、review は 300〜500 字の Information Gain
 *     段落、と役割を明示的に分離する。
 *   - server-only。fs を直接読むため、本ファイルを client component から
 *     import するとビルド時にコケる（意図的な防衛線）。
 *   - キャッシュ: モジュールレベル Map に保持。Next.js のリクエストスコープ
 *     キャッシュではなく、ビルド時 / Lambda インスタンス寿命の単純メモ化で
 *     十分（コンテンツは再ビルドで差し替わる）。
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type WorkReview = {
  contentId: string;
  body: string;
  source: "live" | "fixture";
  promptVersion: string;
  generatedAt: string;
  bodyChars: number;
};

const REVIEWS_DIR = join(process.cwd(), "src", "data", "work-reviews");

let cache: Map<string, WorkReview> | null = null;

function parseFrontmatter(md: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!md.startsWith("---")) return { meta: {}, body: md.trim() };
  const end = md.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: md.trim() };
  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 4).trim();
  const meta: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      try {
        value = JSON.parse(value);
      } catch {
        // フォーマット崩れは raw のまま落とす（防御的に飲み込む）。
      }
    }
    meta[key] = value;
  }
  return { meta, body };
}

function loadAll(): Map<string, WorkReview> {
  const next = new Map<string, WorkReview>();
  let entries: string[] = [];
  try {
    entries = readdirSync(REVIEWS_DIR);
  } catch {
    // dir 未生成は許容（CCO 生成スクリプトが未走の build でも UI は壊さない）。
    return next;
  }
  for (const name of entries) {
    if (!name.endsWith(".md")) continue;
    const contentId = name.slice(0, -3);
    const raw = readFileSync(join(REVIEWS_DIR, name), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    if (!body) continue;
    const source = (meta.source === "live" ? "live" : "fixture") as "live" | "fixture";
    next.set(contentId, {
      contentId,
      body,
      source,
      promptVersion: meta.prompt_version ?? "unknown",
      generatedAt: meta.generated_at ?? "",
      bodyChars: Number.isFinite(Number(meta.body_chars))
        ? Number(meta.body_chars)
        : body.length,
    });
  }
  return next;
}

/**
 * 作品 content_id に紐付く CCO レビューを取得する。
 * 未生成 / md 不在の場合は undefined を返す（page.tsx 側で optional 描画）。
 */
export function getWorkReview(contentId: string): WorkReview | undefined {
  if (!cache) cache = loadAll();
  return cache.get(contentId);
}
