/**
 * Phase 1 判定材料 — X 投稿別アナリティクスの集計（§21-7 決定木）
 *
 * 入力: x-analytics-20260912-raw.tsv（読取ログ・再読行を含む。postId ごとに最後の完全行を採用）
 * 出力: 標準出力に Markdown 表と §21-7 の各段の値
 *
 * 【厳守】判定文は書かない。数値と定義可否のみ出力する。判定は CSO。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rows = readFileSync(join(here, "x-analytics-20260912-raw.tsv"), "utf8")
  .trim().split("\n").slice(1).map((l) => {
    const [side, postId, name, imp, eng, detail, prof, link, read_at, note] = l.split("\t");
    return { side, postId, name, imp, eng, detail, prof, link, read_at, note };
  });

// postId ごとに「全5項目が数値の行」のうち最後のものを採用（再読で上書き）
const byId = new Map();
for (const r of rows) {
  const complete = [r.imp, r.eng, r.detail, r.prof, r.link].every((v) => /^\d+$/.test(v));
  if (!complete) continue;
  byId.set(r.postId, { ...r, imp: +r.imp, eng: +r.eng, detail: +r.detail, prof: +r.prof, link: +r.link });
}
const all = [...byId.values()];
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const n = s.length; if (!n) return null; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const fmt = (v) => v === null ? "—" : Number.isInteger(v) ? String(v) : v.toFixed(4);

console.log(`採用行数（postId ユニーク）: ${all.length}`);
const excluded = all.filter((r) => r.imp === 0);
const kept = all.filter((r) => r.imp > 0);
console.log(`§21-7(1) インプレッション 0 による除外: ${excluded.length} 件 ${excluded.map((r) => r.name).join(", ")}`);

for (const side of ["video", "text"]) {
  const g = kept.filter((r) => r.side === side);
  const rates = g.map((r) => r.link / r.imp);
  console.log(`\n### ${side}  n=${g.length}`);
  console.log(`| # | 投稿 | postId | imp | eng | detail | prof | link | link/imp | 取得時刻(JST) |`);
  console.log(`|---|---|---|---|---|---|---|---|---|---|`);
  g.forEach((r, i) => console.log(`| ${i + 1} | ${r.name.replace(/\(再読\)$/, "")} | ${r.postId} | ${r.imp} | ${r.eng} | ${r.detail} | ${r.prof} | ${r.link} | ${(r.link / r.imp).toFixed(4)} | ${r.read_at} |`));
  console.log(`\n- リンククリック率 中央値: **${fmt(median(rates))}**（分子 link の合計 ${g.reduce((a, r) => a + r.link, 0)} / 分母 imp の合計 ${g.reduce((a, r) => a + r.imp, 0)}）`);
  console.log(`- 補助（参考のみ・判定に使わない）: インプレッション中央値 ${fmt(median(g.map((r) => r.imp)))} / エンゲージメント中央値 ${fmt(median(g.map((r) => r.eng)))} / 詳細クリック中央値 ${fmt(median(g.map((r) => r.detail)))} / リンククリック>0 の件数 ${g.filter((r) => r.link > 0).length}`);
}
const mv = median(kept.filter((r) => r.side === "video").map((r) => r.link / r.imp));
const mt = median(kept.filter((r) => r.side === "text").map((r) => r.link / r.imp));
console.log(`\n§21-7(2) 比の定義可否: 動画側中央値 ${fmt(mv)} / テキスト側中央値 ${fmt(mt)} → ${mv === 0 || mt === 0 ? "**いずれかの側で中央値 0 → 比は定義不能**" : `比 = ${(mv / mt).toFixed(4)}`}`);
