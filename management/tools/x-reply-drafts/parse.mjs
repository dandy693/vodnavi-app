// 束2 リプ案生成ツール — 入力パーサ（純関数 + CLI）
// 入力 1 行＝ `@ハンドル｜投稿日時｜投稿URL｜本文｜作品コード（任意）`（設計書 §1・CSO 2026-09-18）
//   - 区切りは全角「｜」(U+FF5C) を第一候補、半角「|」を第二候補。同一行内で混在したら「解析不能」。
//   - 本文は③の次から末尾まで（区切り文字を含みうる）。末尾フィールドが作品コードの形なら⑤として切り出す。
// 出力: { lines: [{ ok, lineNo, handle, postedAtJst, postedAtIso, postUrl, targetPostId, body, work, warnings, error }] }
// 本ファイルは Airtable / Supabase / ネットワークに触れない。

import fs from "node:fs";
import { pathToFileURL } from "node:url";

export const isMain = (metaUrl) => !!process.argv[1] && metaUrl === pathToFileURL(process.argv[1]).href;

const SEP_FULL = "｜"; // ｜
const SEP_HALF = "|";

export const HINBAN_RE = /^[A-Za-z]{2,6}-\d{3,5}$/;
export const CONTENT_ID_RE = /^[a-z0-9_]+$/;
export const WORKS_URL_RE = /\/works\/(videoa|anime|nikkatsu|amateur|videoc)\/([a-z0-9_]+)\/?(?:[?#].*)?$/i;
export const STATUS_URL_RE = /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com|mobile\.twitter\.com)\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{5,25})(?:[/?#].*)?$/;

/** 全角英数・記号を半角へ（品番・日付の表記揺れ吸収）。 */
export function toHalfWidth(s) {
  return String(s).replace(/[０-９Ａ-Ｚａ-ｚ－：／]/g, (ch) => {
    if (ch === "－") return "-";
    if (ch === "：") return ":";
    if (ch === "／") return "/";
    return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
  });
}

/** 作品コードの解釈。品番 / content_id / works URL の 3 形式。該当しなければ null。 */
export function parseWorkCode(raw) {
  if (raw == null) return null;
  const s = toHalfWidth(String(raw).trim());
  if (!s) return null;
  const m = s.match(WORKS_URL_RE);
  if (m) {
    const floor = m[1].toLowerCase();
    return { kind: "content_id", contentId: m[2].toLowerCase(), floor: floor === "amateur" ? "videoa" : floor, raw: s };
  }
  if (HINBAN_RE.test(s)) return { kind: "hinban", hinban: s.toUpperCase(), raw: s };
  // content_id は品番より緩い形なので後に判定する（URL でも品番でもない小文字英数・数字と英字を両方含む）
  if (CONTENT_ID_RE.test(s) && /\d/.test(s) && /[a-z]/.test(s)) return { kind: "content_id", contentId: s, floor: null, raw: s };
  return null;
}

/** `YYYY-MM-DD HH:mm` / `YYYY/MM/DD HH:mm`（JST）→ ISO(UTC)。解釈不能なら null。 */
export function parseJstDateTime(raw) {
  if (raw == null) return null;
  const s = toHalfWidth(String(raw).trim()).replace(/\s+/g, " ");
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh = "0", mm = "0", ss = "0"] = m;
  const utcMs = Date.UTC(+y, +mo - 1, +d, +hh - 9, +mm, +ss); // JST → UTC
  if (Number.isNaN(utcMs)) return null;
  // 月日の繰り上がり（2026-02-30 等）は不正扱い
  const back = new Date(utcMs + 9 * 3600 * 1000);
  if (back.getUTCFullYear() !== +y || back.getUTCMonth() !== +mo - 1 || back.getUTCDate() !== +d) return null;
  return new Date(utcMs).toISOString();
}

/** 1 行を解析する。失敗しても throw しない（行ごとに ok=false と理由を返す）。 */
export function parseLine(line, lineNo = 1) {
  const warnings = [];
  const text = String(line ?? "").replace(/\r$/, "");
  if (!text.trim()) return { ok: false, lineNo, error: "空行", warnings };
  const hasFull = text.includes(SEP_FULL);
  const hasHalf = text.includes(SEP_HALF);
  if (hasFull && hasHalf) return { ok: false, lineNo, error: "区切り文字（全角｜と半角|）が混在", warnings };
  if (!hasFull && !hasHalf) return { ok: false, lineNo, error: "区切り文字がない", warnings };
  const sep = hasFull ? SEP_FULL : SEP_HALF;
  const parts = text.split(sep);
  if (parts.length < 4) return { ok: false, lineNo, error: `フィールド不足（${parts.length} 個・最低 4）`, warnings };

  // ① ハンドル（@ 省略可・大文字小文字は保持）
  const handle = toHalfWidth(parts[0].trim()).replace(/^[@＠]/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) return { ok: false, lineNo, error: `ハンドルが不正: ${parts[0].trim()}`, warnings };

  // ② 投稿日時（解釈不能なら空で続行・警告）
  const postedAtJst = parts[1].trim();
  const postedAtIso = parseJstDateTime(postedAtJst);
  if (postedAtJst && !postedAtIso) warnings.push(`投稿日時を解釈できない（空として続行）: ${postedAtJst}`);

  // ③ 投稿 URL
  const postUrl = toHalfWidth(parts[2].trim());
  const um = postUrl.match(STATUS_URL_RE);
  if (!um) return { ok: false, lineNo, error: `投稿 URL が x.com/twitter.com の status 形式でない: ${postUrl}`, warnings };
  const urlHandle = um[1];
  const targetPostId = um[2];
  if (urlHandle.toLowerCase() !== handle.toLowerCase()) warnings.push(`URL のハンドル(@${urlHandle})が①(@${handle})と一致しない`);

  // ④ 本文（③の次から末尾まで）。⑤ 末尾が作品コードの形ならそれを切り出す
  let rest = parts.slice(3);
  let work = null;
  if (rest.length >= 2) {
    const tail = parseWorkCode(rest[rest.length - 1]);
    if (tail) {
      work = tail;
      rest = rest.slice(0, -1);
    }
  }
  const body = rest.join(sep).trim();
  if (!body) return { ok: false, lineNo, error: "本文が空", warnings };
  if (work == null && rest.length >= 2) warnings.push("末尾フィールドは作品コードの形でないため本文の一部として扱った");

  return { ok: true, lineNo, handle, postedAtJst: postedAtJst || null, postedAtIso, postUrl, targetPostId, body, work, warnings };
}

export function parseInput(text) {
  const lines = String(text ?? "").replace(/^﻿/, "").split(/\n/);
  const out = [];
  lines.forEach((l, i) => {
    const t = l.trim();
    if (!t || t.startsWith("#")) return; // 空行と # で始まるコメント行は読み飛ばす
    out.push(parseLine(l, i + 1));
  });
  return { lines: out, okCount: out.filter((x) => x.ok).length, ngCount: out.filter((x) => !x.ok).length };
}

// CLI: node parse.mjs input.txt > parsed.json  （引数なしなら stdin）
if (isMain(import.meta.url)) {
  const src = process.argv[2] ? fs.readFileSync(process.argv[2], "utf8") : fs.readFileSync(0, "utf8");
  const res = parseInput(src);
  process.stdout.write(JSON.stringify(res, null, 2) + "\n");
  if (res.ngCount) process.stderr.write(`[parse] ok=${res.okCount} ng=${res.ngCount}\n`);
}
