/**
 * posts テーブルの定期全件走査（蓄積データの棚卸し）。
 *
 * 【なぜ必要か】§10 の読み戻し検算は「**書いた直後**」にしか効かない。
 * 一度書かれて誰も再検査しない値は、そのまま残り続ける（実例: UTM の campaign 不一致は
 * 配信後に発見され、読み戻しでは防げなかった）。本スクリプトはその穴を塞ぐ。
 *
 * 【厳守1】**検査ロジックを再実装しない。** `x-post-generator.mjs` の `GUARDS` を
 * そのまま import して呼ぶ。二重管理になった時点で、片方だけ更新されて検査が形骸化する。
 *
 * 【厳守2】**検出のみ。修正は一切行わない。** 配信済みを書き換えても X 上の投稿は変わらず、
 * 「配信された内容」と「記録された内容」が食い違って以後の分析が壊れる。
 *
 * 【実行】手動起動のみ（スケジュール実行は採らない。2026-08-13 の待機タイマー停止＝原因未特定を踏まえた判断）。
 *
 *   node audit-posts.mjs --input <dump.json>   … JSON ダンプを走査する（現行の経路）
 *   node audit-posts.mjs --fetch               … Airtable API から直接取得する
 *                                                 ※ AIRTABLE_PAT が必要。**未発行のため現時点では使えない**
 *   （任意）--out <path.md>                     … レポートをファイルへも書き出す
 */
import { readFileSync, writeFileSync } from "node:fs";
import {
  GUARDS, jstDate, jstString, weightedLength, postedText,
  toHinban, numericPrefixOf,
} from "./x-post-generator.mjs";

export const BASE_ID = "app0VKGU2B16qny6c";
export const TABLE_ID = "tblZMqvjtJY8MfaWZ";

/** Airtable の `タイプ` → ガードが期待する `kind`。 */
export const KIND_BY_TYPE = {
  "T1改": "T1", "T5コンシェルジュ": "T5", "TG": "TG",
  "T6TV": "T6TV", "T3セール": "T3セール", "リンクなし": "リンクなし",
};

/**
 * `タイプ` の値が上表に無い場合、`kind` が undefined になり
 * **`g3`/`g10` が「T1改 として」誤発火する**（初回走査で実測）。黙って通さず落とす。
 */
export function assertKnownTypes(records) {
  const unknown = [...new Set(records.map((r) => {
    const v = (r.cellValuesByFieldId ?? r.fields ?? {}).fldWn1DLzKGacDC26;
    return v && typeof v === "object" ? v.name : v;
  }))].filter((t) => t && !KIND_BY_TYPE[t]);
  if (unknown.length) throw new Error(`KIND_BY_TYPE に無い タイプ: ${unknown.join(" / ")}`);
}

/**
 * 事後検査から除外するガードと、その理由。
 * **「検査しなかった」ことを黙って落とさない**ため、レポートに必ず出力する。
 */
export const EXCLUDED_GUARDS = {
  g12_actress_not_recent:
    "行に女優名フィールドが無く、事後には検査できない（本文からの氏名抽出は誤検出しやすいため採らない）",
  /**
   * 【2026-08-13 初回走査で判明・設計の訂正】
   * 設計時は「TG の slug と 予約日時 から算出できる＝事後検査可能」としていたが、**誤りだった**。
   * `g16` が参照する `TG_LAST_USED` は **生成時点のスナップショット（静的な表）**であり、
   * 行のデータではない。過去の行を現在のスナップショットと突き合わせると、
   * **自分自身と比較して 0日** になったり、**未来の使用と比較して負の日数**になる（実測: 12件が誤検出）。
   * これは `g12` の「園田茉莉華」自己衝突と**同型の誤り**である。
   * → 行の集合から実際の間隔を計算する検査は `g16` の再利用ではなく**別物**なので、
   *   `p3` として次便で設計・実装する（本便では検査しない）。
   */
  g16_article_interval:
    "生成時点のスナップショット TG_LAST_USED に依存し、行のデータだけでは判定できない（自己比較で0日・未来との比較で負の日数になる）",
};

/**
 * `g9` は **Z 終端の検査のみに縮退**する。
 * 理由: `g9` は「保存された UTC が**意図した JST** と一致するか」を検査するが、
 * **`intendedJst` は行に保存されていない**ため事後には照合できない。
 * → 縮退は `intendedJst` に「保存値から算出した JST」を渡すことで行う。
 *   **ガード本体は一切書き換えない**（JST 比較が恒真になり、Z 終端の検査だけが残る）。
 */
const degradeG9 = (p) => ({ ...p, intendedJst: p.scheduledUtc ? jstString(p.scheduledUtc) : undefined });

/** 予約日時を持たない行では判定できないガード（未配信・未予約のストック等）。 */
const DATE_DEPENDENT = new Set([
  "g6_one_affiliate_per_day", "g8_time_window", "g9_utc_iso",
  "g11_one_work_intro_per_day", "g16_article_interval",
]);

/** Airtable のレコード → ガードが受け取る post 形状。 */
export function toPost(rec) {
  const f = rec.cellValuesByFieldId ?? rec.fields ?? {};
  const pick = (v) => (v && typeof v === "object" && "name" in v ? v.name : v);
  const linkUrl = f.fldkk8CfCKXyqPNFO ?? null;
  const type = pick(f.fldWn1DLzKGacDC26) ?? null;

  let contentId = null, hinban = null;
  const m = String(linkUrl ?? "").match(/\/works\/[a-z]+\/([a-z0-9]+)$/);
  if (m) { contentId = m[1]; hinban = toHinban(contentId); }

  return {
    id: rec.id,
    name: f.fldSFgqqf40w8D2hQ ?? rec.id,
    text: f.fldFMfnZXxnhSviDr ?? "",
    linkUrl,
    type,
    kind: KIND_BY_TYPE[type] ?? null,
    status: pick(f.fldiGogHs9F7w5t2q) ?? null,
    scheduledUtc: f.fldDrNzqVRb9LxxqD ?? null,
    postId: f.fldLdjZEjuCqGt0UH ?? null,
    contentId, hinban,
  };
}

/** p1: `投稿済` なのに `ポストID` が無い（配信の実在を判定できる唯一の機械的手掛かり）。 */
export function p1_postid_missing(p) {
  if (p.status !== "投稿済") return { ok: true, ng: null };
  return p.postId
    ? { ok: true, ng: null }
    : { ok: false, ng: "投稿済だが ポストID が無い（X 上の実在は目視確認を要する）" };
}

/**
 * p2: 本文に書かれた期限を、掲出日が過ぎている（`T3セール` 等の外部情報依存）。
 * **未配信の行のみを対象**とする（配信済みは遡及修正しないため検出しても行動できない）。
 */
export function p2_expired_deadline(p) {
  if (p.status === "投稿済") return { ok: true, ng: null };
  if (!p.scheduledUtc) return { ok: true, ng: null };
  const m = String(p.text).match(/(\d{1,2})\/(\d{1,2})\s*(?:\([日月火水木金土]\))?\s*(?:\d{1,2}:\d{2})?\s*(?:まで|迄)/);
  if (!m) return { ok: true, ng: null };
  const day = jstDate(p.scheduledUtc); // YYYY-MM-DD
  const year = Number(day.slice(0, 4));
  const deadline = `${year}-${String(m[1]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
  return day <= deadline
    ? { ok: true, ng: null }
    : { ok: false, ng: `本文の期限 ${deadline} を掲出日 ${day} が過ぎている` };
}

export const EXTRA_CHECKS = { p1_postid_missing, p2_expired_deadline };

export function audit(records) {
  assertKnownTypes(records);
  const posts = records.map(toPost);

  // g6 / g11 は同日の他行を数えるため、全件を文脈として渡す（本番の runGuards と同じ数え方）。
  const affiliateCountByJstDate = {}, workIntroCountByJstDate = {};
  for (const p of posts) {
    if (!p.scheduledUtc) continue;
    let d; try { d = jstDate(p.scheduledUtc); } catch { continue; }
    const isAff = /al\.(dmm|fanza)\.co\.jp/.test(p.linkUrl ?? "");
    const isWork = String(p.linkUrl ?? "").includes("app.vodnavi.jp/works/");
    if (isAff) affiliateCountByJstDate[d] = (affiliateCountByJstDate[d] ?? 0) + 1;
    if (isWork) workIntroCountByJstDate[d] = (workIntroCountByJstDate[d] ?? 0) + 1;
  }
  const ctx = { affiliateCountByJstDate, workIntroCountByJstDate };

  const violations = [], skipped = [];
  for (const p of posts) {
    for (const [id, fn] of Object.entries(GUARDS)) {
      if (EXCLUDED_GUARDS[id]) continue;
      if (!p.scheduledUtc && DATE_DEPENDENT.has(id)) { skipped.push({ post: p, guard: id, why: "予約日時が未設定" }); continue; }
      const r = fn(id === "g9_utc_iso" ? degradeG9(p) : p, ctx);
      if (!r.ok) violations.push({ post: p, guard: id, ng: r.ng });
    }
    for (const [id, fn] of Object.entries(EXTRA_CHECKS)) {
      const r = fn(p);
      if (!r.ok) violations.push({ post: p, guard: id, ng: r.ng });
    }
  }
  return { posts, violations, skipped, ctx };
}

// ── レポート ───────────────────────────────────────────────
const DELIVERED = (p) => p.status === "投稿済";

export function report(res) {
  const L = [];
  const w = (s = "") => L.push(s);
  const { posts, violations, skipped } = res;

  const nDeliv = posts.filter(DELIVERED).length;
  const nUndeliv = posts.length - nDeliv;
  const vDeliv = violations.filter((v) => DELIVERED(v.post));
  const vUndeliv = violations.filter((v) => !DELIVERED(v.post));

  w("# posts 全件走査レポート");
  w();
  w(`- **検査対象**: ${posts.length} 件（配信済み ${nDeliv} / 未配信 ${nUndeliv}）`);
  w(`- **検査したガード**: ${Object.keys(GUARDS).length - Object.keys(EXCLUDED_GUARDS).length} 件 ＋ 追加検査 ${Object.keys(EXTRA_CHECKS).length} 件`);
  w(`- **違反**: **${violations.length} 件**（配信済み ${vDeliv.length} / 未配信 ${vUndeliv.length}）`);
  w();
  w("## 検査しなかったもの（黙って落とさない）");
  w();
  for (const [id, why] of Object.entries(EXCLUDED_GUARDS)) w(`- **${id}** … ${why}`);
  w(`- **g9_utc_iso** … **Z 終端の検査のみに縮退**。\`intendedJst\` が行に保存されていないため、JST 換算の意図一致は事後検査できない`);
  if (skipped.length) {
    w(`- **予約日時が未設定のため判定不能**: ${skipped.length} 件`);
    for (const s of skipped) w(`  - ${s.post.name} / ${s.guard}`);
  }
  w();

  const byGuard = {};
  for (const v of violations) (byGuard[v.guard] ??= []).push(v);

  w("## 違反の種別ごとの件数");
  w();
  w("| 検査 | 件数 | 配信済み | 未配信 |");
  w("|---|---|---|---|");
  for (const [g, vs] of Object.entries(byGuard).sort((a, b) => b[1].length - a[1].length))
    w(`| \`${g}\` | ${vs.length} | ${vs.filter((v) => DELIVERED(v.post)).length} | ${vs.filter((v) => !DELIVERED(v.post)).length} |`);
  if (!violations.length) w("| （違反なし） | 0 | 0 | 0 |");
  w();

  for (const [label, list] of [["配信済み（**遡及修正しない**・記録のみ）", vDeliv], ["未配信（**差し替えの要否は CSO 判断**）", vUndeliv]]) {
    w(`## ${label}`);
    w();
    if (!list.length) { w("違反なし。"); w(); continue; }
    w("| レコードID | 名称 | ステータス | 予約日時(JST) | 違反 | 実測値 |");
    w("|---|---|---|---|---|---|");
    for (const v of list) {
      const jst = v.post.scheduledUtc ? jstString(v.post.scheduledUtc) : "（未設定）";
      w(`| \`${v.post.id}\` | ${v.post.name} | ${v.post.status} | ${jst} | \`${v.guard}\` | ${v.ng} |`);
    }
    w();
  }

  w("## 文字数の分布（g7・本文＋リンクURL の実投稿形）");
  w();
  const over = posts.filter((p) => weightedLength(postedText(p)) > 280);
  w(`- 上限 280 超過: **${over.length} 件**`);
  for (const p of over.sort((a, b) => weightedLength(postedText(b)) - weightedLength(postedText(a))))
    w(`  - ${p.name} … **${weightedLength(postedText(p))}**（${p.status}${p.postId ? "" : "・ポストID なし"}）`);
  w();
  return L.join("\n");
}

// ── 入力 ───────────────────────────────────────────────────
async function fetchAll() {
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) throw new Error("AIRTABLE_PAT が未設定。PAT の発行は HUMAN 枠。--input <dump.json> を使うこと");
  const out = [];
  let offset;
  do {
    const u = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    u.searchParams.set("pageSize", "100");
    u.searchParams.set("returnFieldsByFieldId", "true");
    if (offset) u.searchParams.set("offset", offset);
    const r = await fetch(u, { headers: { Authorization: `Bearer ${pat}` } });
    if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
    const j = await r.json();
    out.push(...j.records);
    offset = j.offset;
  } while (offset);
  return out;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const argv = process.argv.slice(2);
  const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const records = argv.includes("--fetch")
    ? await fetchAll()
    : JSON.parse(readFileSync(arg("--input"), "utf8")).records;
  const res = audit(records);
  const md = report(res);
  console.log(md);
  const out = arg("--out");
  if (out) { writeFileSync(out, md + "\n", "utf8"); console.error(`\n→ ${out} に書き出した`); }
  // 【厳守】検出のみ。修正は一切行わない。
}
