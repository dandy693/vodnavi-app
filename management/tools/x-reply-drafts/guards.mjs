// 束2 リプ案生成ツール — ガード guardReply(text, ctx)（純関数）
// 設計書 §4（R1〜R10）＋ CSO裁定 2026-09-18 C（R11 虚偽体験語）・D（R10 は R9 出典検査に統合）。
// 語リストは guards.config.json（HUMAN 編集可）。本ファイルは語を持たない。
// ctx = {
//   type: "A"|"B"|"C",   // 案の型（R9 の全数値検査は B のみ・価格/割引の数値は全案）
//   names: string[],     // 出演者名など敬称必須の名前（R7）
//   sources: string[],   // 数値の出典（相手投稿本文・作品知識 JSON など）（R9）
//   config?: object,     // 省略時は guards.config.json を読む
// }
// 戻り値 { ok, failures: [{ rule, detail }], metrics: { chars, weight } }

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
let cachedConfig = null;
export function loadConfig(file = path.join(HERE, "guards.config.json")) {
  if (!cachedConfig) cachedConfig = JSON.parse(fs.readFileSync(file, "utf8"));
  return cachedConfig;
}

/** X の重み: コードポイント 0〜4351 / 8192〜8205 / 8208〜8223 / 8242〜8247 は 1、それ以外は 2。 */
export function xWeight(text) {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    w += c <= 4351 || (c >= 8192 && c <= 8205) || (c >= 8208 && c <= 8223) || (c >= 8242 && c <= 8247) ? 1 : 2;
  }
  return w;
}

export function charCount(text) {
  return Array.from(text).length;
}

/** 全角数字・全角％を半角へ、桁区切りカンマを除去して比較用に正規化。 */
export function normalizeNumbers(s) {
  return String(s ?? "")
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/(\d),(?=\d{3}(?!\d))/g, "$1")
    .replace(/％/g, "%");
}

/** 本文中の数値トークン（正規化後）。「2026-09-18」「3,740」「50%」「185分」の数字部分。 */
export function extractNumbers(text) {
  return Array.from(normalizeNumbers(text).matchAll(/\d+(?:\.\d+)?/g), (m) => m[0]);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesEntry(text, entry) {
  if (typeof entry === "string") {
    if (/^[\x20-\x7E]+$/.test(entry)) return text.toLowerCase().includes(entry.toLowerCase()) ? entry : null;
    return text.includes(entry) ? entry : null;
  }
  if (entry && typeof entry.regex === "string") {
    const m = text.match(new RegExp(entry.regex, entry.flags ?? ""));
    return m ? `${m[0]}（regex: ${entry.regex}）` : null;
  }
  return null;
}

function listHits(text, list) {
  const hits = [];
  for (const e of list ?? []) {
    const h = matchesEntry(text, e);
    if (h) hits.push(h);
  }
  return hits;
}

export const R1_URL = [
  /https?:\/\//i,
  /www\./i,
  /(?:^|[^A-Za-z0-9぀-ヿ一-鿿])[a-z0-9-]+\.(?:com|jp|co\.jp|net|io|me)(?=\/|$|[^A-Za-z0-9])/i,
  /(?:^|[^A-Za-z0-9])t\.co(?=\/|$|[^A-Za-z0-9])/i,
];
export const R2_MENTION = /[@＠]/;
export const R3_SELF = /vodnavi|ボドナビ|af_id|moterist/i;
export const R4_HASHTAG = /[#＃]/;
/** 数値＋価格・割引の単位（円 / % / 割 / OFF）。R9 に統合した旧 R10（裁定 D）。 */
export const PRICE_TOKEN = /(\d+(?:\.\d+)?)\s*(?:円|%|割引?|OFF)/gi;

/**
 * @param {string} text
 * @param {{type?: string, names?: string[], sources?: string[], config?: object}} ctx
 */
export function guardReply(text, ctx = {}) {
  const cfg = ctx.config ?? loadConfig();
  const t = String(text ?? "").replace(/\s+$/u, "");
  const failures = [];
  const push = (rule, detail) => failures.push({ rule, detail });

  // R1 URL / ドメイン
  for (const re of R1_URL) {
    const m = t.match(re);
    if (m) {
      push("R1", `URL/ドメイン: ${m[0].trim()}`);
      break;
    }
  }
  // R2 メンション
  if (R2_MENTION.test(t)) push("R2", "@ を含む");
  // R3 自社・af_id
  {
    const m = t.match(R3_SELF);
    if (m) push("R3", `自社語/af_id: ${m[0]}`);
  }
  // R4 ハッシュタグ
  if (R4_HASHTAG.test(t)) push("R4", "# を含む");
  // R5 宣伝語
  {
    const h = listHits(t, cfg.R5_promo);
    if (h.length) push("R5", `宣伝語: ${h.join("、")}`);
  }
  // R6 容姿・露骨
  {
    const h = listHits(t, cfg.R6_appearance_explicit);
    if (h.length) push("R6", `容姿・露骨語: ${h.join("、")}`);
  }
  // R7 敬称（名前が出るなら「名＋さん」）
  for (const name of ctx.names ?? []) {
    if (!name || !t.includes(name)) continue;
    if (new RegExp(escapeRe(name) + "(?!さん)").test(t)) push("R7", `「${name}」に「さん」が付いていない`);
  }
  // R8 字数・重み
  const chars = charCount(t);
  const weight = xWeight(t);
  const lim = cfg.R8_chars ?? { min: 80, max: 140 };
  if (chars < lim.min || chars > lim.max) push("R8", `字数 ${chars}（${lim.min}〜${lim.max}）`);
  if (weight > 280) push("R8", `X 重み ${weight}（≤280）`);
  // R9 数値の出典（B 案＝全数値／全案＝価格・割引の数値）
  const srcNorm = (ctx.sources ?? []).map(normalizeNumbers).join("\n");
  const missing = (list) => list.filter((n) => !srcNorm.includes(n));
  if ((ctx.type ?? "B") === "B") {
    const miss = missing(extractNumbers(t));
    if (miss.length) push("R9", `出典のない数値（B）: ${miss.join("、")}`);
  }
  {
    const priceNums = Array.from(normalizeNumbers(t).matchAll(PRICE_TOKEN), (m) => m[1]);
    const miss = missing(priceNums);
    if (miss.length) push("R9", `出典のない価格・割引の数値: ${miss.join("、")}`);
  }
  // R11 虚偽の体験主張
  {
    const h = listHits(t, cfg.R11_false_experience);
    if (h.length) push("R11", `体験主張語: ${h.join("、")}`);
  }

  return { ok: failures.length === 0, failures, metrics: { chars, weight } };
}

/** 記録 payload の全文字列に R1〜R3 相当を再適用する（裁定 E・束1 followers-update.mjs の FORBIDDEN と同一）。 */
export const FORBIDDEN = /https?:|vodnavi|af_id|moterist-\d{3}/i;
export function checkPayloadForbidden(obj, allowKeys = []) {
  const hits = [];
  const walk = (v, p) => {
    if (typeof v === "string") {
      if (!allowKeys.includes(p.split(".").pop()) && FORBIDDEN.test(v)) hits.push({ path: p, value: v });
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k);
  };
  walk(obj, "");
  return hits;
}
