// 束2 リプ案生成ツール — ガード guardReply(text, ctx)（純関数）
// 設計書 §4（R1〜R10）＋ CSO裁定 2026-09-18 C（R11 虚偽体験語）・D（R10 は R9 出典検査に統合）。
// 語リストは guards.config.json（HUMAN 編集可）。本ファイルは語を持たない。
// ctx = {
//   type: "A"|"B"|"C"|"Q", // 案の型（R9 の全数値検査は B・Q・価格/割引の数値は全案）。"Q"＝引用ポストの一言（基盤D・CSO 指示 2026-09-21 夜）:
//                        //   R8 は R8_chars_Q（40〜80）・本文の具体（R14）は不要・cache 由来の事実 1〜2 個（R14-B と同じ）・URL は本体に含めず quote.mjs が付ける
//   names: string[],     // 出演者名など敬称必須の名前（R7）
//   sources: string[],   // 数値の出典（相手投稿本文・作品知識 JSON など）（R9）
//   body?: string,       // 相手投稿本文。R5 のヒット語が本文にそのまま含まれていれば免除／R14 の具体トークン源（CSO裁定 2026-09-19）
//   orgNames?: string[], // メーカー・レーベル名（「さん」を付けたら R7 NG・CSO判定 2026-09-19）
//   hasMultiPostEvidence?: boolean, // 複数投稿の根拠がある入力（R13 免除・config で当面無効）
//   knowledge?: object,  // 作品知識（knowledge.mjs --extract の 1 件）。B 型はこれが無いと生成不可・あれば事実を 1〜B_max_knowledge_facts 個含む（R14-B）
//   targetType?: string, // 対象アカウントの type（"女優本人" のとき R17＝「<displayName>さん、」で始める・CSO判定 2026-09-19 12:1x）
//   displayName?: string,// 対象アカウントの表示名（R17）
//   postedAtJst?: string,// 相手投稿の投稿日時（"YYYY-MM-DD HH:mm" JST）。R14-A（A 型の祝福は cache 配信日が投稿日から 3 日以内のときのみ・CSO判定 2026-09-21）
//   config?: object,     // 省略時は guards.config.json を読む
// }
// 語置換（R18・「体験版」→「サンプル動画」）はガードではなく applyReplacements(text, cfg) で生成直後に行う。
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

/** 文数（。！？!? で区切る。末尾の区切りは 1 文として数える）。 */
export function countSentences(text) {
  const t = String(text ?? "").trim();
  if (!t) return 0;
  const parts = t.split(/[。！？!?]+/).map((s) => s.trim()).filter(Boolean);
  return parts.length;
}

const TOKEN_RE = /[一-鿿ァ-ヺーA-Za-z0-9]+/g; // 漢字・カタカナ（「・」は含めない）・英数の連続

/** R6 語の語幹（末尾のひらがなを落とす・2 字以上）。「中出し」→「中出」のように漢字連続トークンと照合するため。 */
function excludeStems(list) {
  const out = [];
  for (const e of list ?? []) {
    if (typeof e !== "string") continue;
    const stem = e.replace(/[ぁ-ゖ]+$/u, "");
    if (Array.from(stem).length >= 2) out.push(stem);
  }
  return out;
}

function tokenize(text, opt = {}, exclude = []) {
  const minLen = opt.min_token_len ?? 2;
  const stop = new Set((opt.stoplist ?? []).map((s) => s.toLowerCase()));
  let b = String(text ?? "");
  b = b.replace(/https?:\/\/\S+/g, " ").replace(/[@＠][A-Za-z0-9_]+/g, " ").replace(/[#＃][^\s#＃]+/g, " ");
  b = b.replace(/[️⃣]/g, ""); // 絵文字キーキャップ（5️⃣0️⃣）を素の数字に
  b = normalizeNumbers(b);
  const nums = new Set();
  const words = new Set();
  const stems = excludeStems(exclude);
  for (const m of b.matchAll(TOKEN_RE)) {
    const tok = m[0];
    if (stems.some((e) => tok.includes(e))) {
      // R6 語（語幹）を含む連続は語としては落とす。中の数値も落とす（「毎日10発中出し」の 10 を渡さない）が、
      // 直後が単位（% 円 位 日 月 弾 作 時 分）なら値段・日付・順位なので残す（「フェラ50%OFF」の 50）。
      for (const n of tok.matchAll(/\d+(?:\.\d+)?/g)) {
        const after = b.charAt(m.index + n.index + n[0].length);
        if (/[%円位日月弾作時分]/.test(after)) nums.add(n[0]);
      }
      continue;
    }
    for (const n of tok.matchAll(/\d+(?:\.\d+)?/g)) nums.add(n[0]);
    if (/^\d+(?:\.\d+)?$/.test(tok)) continue;
    if (Array.from(tok).length < minLen) continue;
    if (stop.has(tok.toLowerCase())) continue;
    words.add(tok);
  }
  return { nums, words, norm: b };
}

/**
 * R14 用: 相手投稿本文から「具体候補」を取り出す（ヒューリスティック・CSO判定 2026-09-19）。
 * URL・@ハンドル・#タグ（裸で書かないため除外）を落とし、数値トークンと 漢字・カタカナ・英数の連続
 * （min_token_len 以上・stoplist 以外・exclude（R6 語）を含まない）を返す。モデルへの hints にも使う。
 */
export function concreteTokens(body, opt = {}, exclude = []) {
  const { nums, words } = tokenize(body, opt, exclude);
  return [...nums, ...words];
}

/** モデルへ渡す具体候補: 数値と、数字・英字を含む語（日付・弾・順位・企画名の形）だけ。漢字だけの断片（作品タイトルの切れ端）は渡さない。 */
export function hintTokens(body, opt = {}, exclude = []) {
  const { nums, words } = tokenize(body, opt, exclude);
  return [...nums, ...[...words].filter((w) => /[0-9A-Za-z]/.test(w))];
}

/**
 * R14 判定: 案の側のトークンを取り、(a) 数値トークンが本文の数値トークンと完全一致、または
 * (b) 語トークン（≥ min_token_len・stoplist/R6 以外）が本文にそのまま含まれる、のどちらかで具体ありとする。
 */
export function hasConcreteFromBody(draft, body, opt = {}, exclude = []) {
  const B = tokenize(body, opt, exclude);
  const D = tokenize(draft, opt, exclude);
  for (const n of D.nums) if (B.nums.has(n)) return { ok: true, hit: n };
  for (const w of D.words) if (B.norm.includes(w)) return { ok: true, hit: w };
  return { ok: false, hit: null };
}

/**
 * B 型の R14 用: 作品知識から「cache 由来の事実」を種別ごとに取り出す（数値は完全一致・語は含有）。R6 語を含むジャンル名は除く。
 * 返り値は [{ cat, key, values }]。配信日は表記ゆれ（9月19日／2026年9月19日／2026-09-19）を 1 つの事実として束ねる。
 */
export function knowledgeFactGroups(k, exclude = []) {
  if (!k || typeof k !== "object") return [];
  const stems = excludeStems(exclude);
  const groups = [];
  const word = (w) => (typeof w === "string" && w.trim() && !stems.some((e) => w.includes(e)) ? w.trim() : null);
  if (k.volume != null && String(k.volume).match(/\d+/)) groups.push({ cat: "volume", key: "volume", values: [String(k.volume).match(/\d+/)[0]] });
  if (typeof k.date === "string") {
    const m = k.date.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) groups.push({ cat: "date", key: "date", values: [`${+m[2]}月${+m[3]}日`, `${m[1]}年${+m[2]}月${+m[3]}日`, m[1] + "-" + m[2] + "-" + m[3]] });
  }
  for (const key of ["series", "genre", "maker", "label", "director", "actress"]) {
    for (const w of k[key] ?? []) {
      const v = word(w);
      if (v) groups.push({ cat: key, key: `${key}:${v}`, values: [v] });
    }
  }
  if (k.review?.count != null) groups.push({ cat: "review", key: "review", values: [String(k.review.count)] });
  if (typeof k.title === "string" && word(k.title)) groups.push({ cat: "title", key: "title", values: [k.title.trim()] });
  return groups;
}

/** 互換: 事実候補のフラットな配列（従来の knowledgeFacts）。 */
export function knowledgeFacts(k, exclude = []) {
  return Array.from(new Set(knowledgeFactGroups(k, exclude).flatMap((g) => g.values)));
}

/** 案に含まれる cache 由来の事実（種別ごと・配信日の表記ゆれは 1 つ）。 */
export function knowledgeFactHits(text, k, exclude = []) {
  const norm = normalizeNumbers(text);
  const nums = new Set(extractNumbers(text));
  const hits = [];
  const seen = new Set(); // 同じ語が series と label の両方にある（例: 本中-VR）ときは 1 つに数える
  for (const g of knowledgeFactGroups(k, exclude)) {
    const v = g.values.find((f) => (/^\d+$/.test(f) ? nums.has(f) : norm.includes(f)));
    if (v && !seen.has(v)) {
      seen.add(v);
      hits.push({ cat: g.cat, key: g.key, value: v });
    }
  }
  // 短い語が長い語に含まれる（例: maker「本中」⊂ label「本中-VR」）ときは長い語だけを数える
  return hits.filter((h) => !hits.some((o) => o !== h && o.value.length > h.value.length && o.value.includes(h.value)));
}

/**
 * R18: 語置換（CSO判定 2026-09-19 12:1x「体験版」→「サンプル動画」）。ガードではなく生成直後の自動置換。
 * 返り値 { text, applied: [{from, to, count}] }。
 */
export function applyReplacements(text, cfg) {
  const table = cfg?.R18_word_replacements ?? {};
  let out = String(text ?? "");
  const applied = [];
  for (const [from, to] of Object.entries(table)) {
    if (!from || typeof to !== "string") continue;
    const count = out.split(from).length - 1;
    if (count > 0) {
      out = out.split(from).join(to);
      applied.push({ from, to, count });
    }
  }
  return { text: out, applied };
}

/** R14-A 用: "YYYY-MM-DD…" 2 つの暦日差（絶対値・日）。どちらかが日付として読めなければ null。 */
export function calendarDayDiff(a, b) {
  const d = (v) => {
    const m = String(v ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
  };
  const x = d(a), y = d(b);
  if (x == null || y == null) return null;
  return Math.abs(Math.round((x - y) / 86400000));
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
    // 全マッチを返す（「第3弾…第4弾」のように同じ regex が複数箇所に当たるとき、本文引用の免除は 1 箇所ずつ判定する・2026-09-21）
    const flags = (entry.flags ?? "").includes("g") ? entry.flags : (entry.flags ?? "") + "g";
    const found = Array.from(text.matchAll(new RegExp(entry.regex, flags)), (m) => m[0]);
    const uniq = [...new Set(found)];
    return uniq.length ? uniq.map((f) => `${f}（regex: ${entry.regex}）`) : null;
  }
  return null;
}

export function listHits(text, list) {
  const hits = [];
  for (const e of list ?? []) {
    const h = matchesEntry(text, e);
    if (Array.isArray(h)) hits.push(...h);
    else if (h) hits.push(h);
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
  // R5 宣伝語（CSO裁定 2026-09-19: 相手投稿本文にそのまま含まれる語句の引用は免除）
  {
    let h = listHits(t, cfg.R5_promo);
    if (cfg.R5_quote_exempt && ctx.body) {
      const body = String(ctx.body);
      h = h.filter((hit) => !body.includes(hit.replace(/（regex: .*）$/, "")));
    }
    if (h.length) push("R5", `宣伝語: ${h.join("、")}`);
  }
  // R6 容姿・露骨
  {
    const h = listHits(t, cfg.R6_appearance_explicit);
    if (h.length) push("R6", `容姿・露骨語: ${h.join("、")}`);
  }
  // R7 敬称（女優名が出るなら「名＋さん」／メーカー・レーベル名には付けない・CSO判定 2026-09-19）
  for (const name of ctx.names ?? []) {
    if (!name || !t.includes(name)) continue;
    if (new RegExp(escapeRe(name) + "(?!さん)").test(t)) push("R7", `「${name}」に「さん」が付いていない`);
  }
  for (const org of ctx.orgNames ?? []) {
    if (org && t.includes(org + "さん")) push("R7", `メーカー・レーベル名「${org}」に「さん」が付いている`);
  }
  // R8 字数・重み・文数
  const chars = charCount(t);
  const weight = xWeight(t);
  const lim = (ctx.type === "Q" && cfg.R8_chars_Q) ? cfg.R8_chars_Q : cfg.R8_chars ?? { min: 80, max: 140 };
  if (chars < lim.min || chars > lim.max) push("R8", `字数 ${chars}（${lim.min}〜${lim.max}）`);
  if (weight > 280) push("R8", `X 重み ${weight}（≤280）`);
  const sentences = countSentences(t);
  if (cfg.R8_sentences_max && sentences > cfg.R8_sentences_max) push("R8", `文数 ${sentences}（≤${cfg.R8_sentences_max}）`);
  // R12 定型句（CSO判定 2026-09-19・癖 1）
  {
    const h = listHits(t, cfg.R12_stock_phrases);
    if (h.length) push("R12", `定型句: ${h.join("、")}`);
  }
  // R13 根拠なし断定語（CSO判定 2026-09-19・癖 3。複数投稿の根拠がある場合の免除は config で当面 false）
  {
    let h = listHits(t, cfg.R13_unfounded_assertions);
    const exempt = cfg.R13_exempt_with_evidence && ctx.hasMultiPostEvidence;
    if (cfg.R13_quote_exempt && ctx.body) h = h.filter((hit) => !String(ctx.body).includes(hit.replace(/（regex: .*）$/, ""))); // 本文にあれば引用（暦語も同じ）
    if (h.length && !exempt) push("R13", `根拠なし断定語: ${h.join("、")}`);
  }
  // R14 具体性（相手投稿本文の具体を 1 つ含む・ヒューリスティック・CSO判定 2026-09-19）
  if (cfg.R14_concreteness && ctx.body && ctx.type !== "Q") {
    const res = hasConcreteFromBody(t, ctx.body, cfg.R14_concreteness, cfg.R6_appearance_explicit ?? []);
    if (!res.ok) {
      const cands = concreteTokens(ctx.body, cfg.R14_concreteness, cfg.R6_appearance_explicit ?? []);
      push("R14", `相手投稿本文の具体（数値・日付・企画名・順位）を含まない（本文の候補: ${cands.slice(0, 8).join("、") || "なし"}）`);
    }
  }
  // R14-B: B 型は cache 由来の事実を 1 つ含む（知識ありモードのみ生成・CSO判定 2026-09-19 dry-run #3）
  //        かつ最大 B_max_knowledge_facts 個まで（CSO判定 2026-09-19 12:1x・監督名・レーベル名の羅列はデータの読み上げ）。
  //        上限の数え方＝種別ごと（配信日の表記ゆれは 1 つ）・出演者名は「名前＋さん」の呼びかけに使うため数えない。
  // Q 型（引用ポストの一言）も同じ: 作品の属性を述べるため cache 由来の事実 1〜2 個を必須にする（CSO 指示 2026-09-21 夜）。
  if (cfg.R14_concreteness?.B_requires_knowledge_fact && ((ctx.type ?? "B") === "B" || ctx.type === "Q")) {
    const tname = ctx.type === "Q" ? "Q" : "B";
    if (!ctx.knowledge) push("R14", `${tname} 型は作品知識（cache ヒット）があるときだけ生成する` + (tname === "B" ? "（知識なしモードでは A・C のみ）" : "（引用は content_id 確定の投稿のみ）"));
    else {
      const hits = knowledgeFactHits(t, ctx.knowledge, cfg.R6_appearance_explicit ?? []);
      if (!hits.length) {
        const facts = knowledgeFacts(ctx.knowledge, cfg.R6_appearance_explicit ?? []);
        push("R14", `${tname} 型に cache 由来の事実（収録時間・配信日・シリーズ・ジャンル・メーカー・出演者など）が無い（候補: ${facts.slice(0, 8).join("、") || "なし"}）`);
      }
      // 上限: B は B_max_knowledge_facts（2）。Q は Q_quote.max_knowledge_facts（既定 3・dry-run 2026-09-21 で 2 だと字数合わせの埋め文が出たため別枠・CSO が変更可）
      const max = ctx.type === "Q" ? (cfg.Q_quote?.max_knowledge_facts ?? cfg.R14_concreteness.B_max_knowledge_facts) : cfg.R14_concreteness.B_max_knowledge_facts;
      const counted = hits.filter((h) => h.cat !== "actress");
      if (max != null && counted.length > max) push("R14", `${tname} 型の cache 由来の事実が ${counted.length} 個（最大 ${max}・優先: 収録時間 > 配信日 > シリーズ > その他）: ${counted.map((h) => h.value).join("、")}`);
    }
  }
  // R14-A: A 型の祝福（おめでと）は cache の配信日が投稿日から A_congrats_window_days 日以内のときだけ許可（CSO判定 2026-09-21 朝）。
  // それ以外の A 型は祝福ではなく本文の具体 1 つへの一言。ctx.postedAtJst が無ければ検査しない（generate.mjs は常に渡す）。
  if ((ctx.type ?? "B") === "A" && ctx.postedAtJst && cfg.R14_concreteness?.A_congrats_window_days != null) {
    const phrases = cfg.R14_concreteness.A_congrats_phrases ?? ["おめでと"];
    const hit = listHits(t, phrases);
    if (hit.length) {
      const win = cfg.R14_concreteness.A_congrats_window_days;
      const diff = calendarDayDiff(ctx.knowledge?.date, ctx.postedAtJst);
      if (diff == null) push("R14", `A 型の祝福（${hit.join("、")}）は cache の配信日が投稿日から ${win} 日以内のときのみ（作品知識に配信日が無い＝祝福ではなく本文の具体 1 つへの一言にする）`);
      else if (diff > win) push("R14", `A 型の祝福（${hit.join("、")}）は cache の配信日が投稿日から ${win} 日以内のときのみ（配信日 ${String(ctx.knowledge.date).slice(0, 10)}・投稿日 ${String(ctx.postedAtJst).slice(0, 10)}・差 ${diff} 日）`);
    }
  }
  // R17 女優本人向けの案は「<表示名>さん、」で始める（CSO判定 2026-09-19 12:1x の PROMPT 規則の機械検査・CTO 追加）
  if (cfg.R17_actress_greeting && ctx.targetType === "女優本人" && ctx.displayName) {
    const re = new RegExp("^" + escapeRe(String(ctx.displayName).trim()) + "さん[、，]");
    if (!re.test(t)) push("R17", `女優本人向けの案は「${String(ctx.displayName).trim()}さん、」で始める`);
  }
  // R16 日付表記（「09/18」「9/18」を写さず「9月18日」に正規化する・CSO判定 2026-09-19 の PROMPT 規則の機械検査・CTO 追加）
  if (cfg.R16_date_format) {
    const m = t.match(/(?:^|[^\d])(\d{1,2}\/\d{1,2})(?!\d)/);
    if (m) push("R16", `日付の斜線表記: ${m[1]}（「M月D日」で書く）`);
  }
  // R15 メタ言及（告知の形式・並べ方・出し方）
  {
    const h = listHits(t, cfg.R15_meta_mentions);
    if (h.length) push("R15", `告知の形式への言及: ${h.join("、")}`);
  }
  // R9 数値の出典（B 案＝全数値／全案＝価格・割引の数値）
  const srcNorm = (ctx.sources ?? []).map(normalizeNumbers).join("\n");
  const missing = (list) => list.filter((n) => !srcNorm.includes(n));
  if ((ctx.type ?? "B") === "B" || ctx.type === "Q") {
    const miss = missing(extractNumbers(t));
    if (miss.length) push("R9", `出典のない数値（${ctx.type === "Q" ? "Q" : "B"}）: ${miss.join("、")}`);
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

/**
 * 引用ポスト（基盤D・CSO 指示 2026-09-21 夜）の全文検査: 「一言 ＋ 自サイト works 詳細 URL 1 本」だけを許す R1 の例外。
 *   - allowedUrl がちょうど 1 回、末尾（改行区切り）にあること
 *   - URL を除いた残り（一言）に R1〜R4（URL / @ / vodnavi・af_id / #）が無いこと
 *   - X 重み（URL は t.co の 23 として数える）≤ 280
 * 返り値 { ok, failures, metrics: { weight } }
 */
export function guardQuoteFull(full, { allowedUrl } = {}) {
  const failures = [];
  const push = (rule, detail) => failures.push({ rule, detail });
  const t = String(full ?? "").replace(/\s+$/u, "");
  if (!allowedUrl) push("Q-URL", "allowedUrl が無い");
  const n = allowedUrl ? t.split(allowedUrl).length - 1 : 0;
  if (allowedUrl && n !== 1) push("Q-URL", `許可 URL の出現が ${n} 回（ちょうど 1 回）`);
  if (allowedUrl && n === 1 && !t.endsWith("\n" + allowedUrl)) push("Q-URL", "URL は本文の末尾に改行で区切って 1 本だけ置く");
  const rest = allowedUrl ? t.split(allowedUrl).join("") : t;
  for (const re of R1_URL) {
    const m = rest.match(re);
    if (m) {
      push("R1", `許可 URL 以外の URL/ドメイン: ${m[0].trim()}`);
      break;
    }
  }
  if (R2_MENTION.test(rest)) push("R2", "@ を含む");
  {
    const m = rest.match(R3_SELF);
    if (m) push("R3", `自社語/af_id（URL の外）: ${m[0]}`);
  }
  if (R4_HASHTAG.test(rest)) push("R4", "# を含む");
  const weight = xWeight(rest.replace(/\s+$/u, "")) + (allowedUrl ? 23 : 0);
  if (weight > 280) push("R8", `X 重み ${weight}（URL は 23 として計上・≤280）`);
  return { ok: failures.length === 0, failures, metrics: { weight } };
}

