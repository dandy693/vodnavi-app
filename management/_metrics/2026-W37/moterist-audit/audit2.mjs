/**
 * moterist.com 監査 v2 — 第122便 A(1) 時点注記の棚卸し / A(3) 内部リンク構造
 *
 * 【v1 の誤りの訂正】v1 は `<article>` タグを本文コンテナとしたが moterist に article は 0個で、
 *   フォールバックで全 HTML を走査していた。その結果、検出した「時点注記1件・国内最大級1件」は
 *   すべて __M1 のインフォメーションバー（全ページ共通のヘッダ）__ であり、本文の実測ではなかった。
 *   v2 は WP REST API の `content.rendered`（本文のみ）を対象にする。
 *
 * 【厳守】読み取りのみ。moterist への書き込みは一切しない（REST API も GET のみ）。
 * 【厳守】事実の抽出のみ。評価・提案は書かない。
 */
import { writeFileSync } from "node:fs";

const DIR = "management/_metrics/2026-W37/moterist-audit";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jst = () => new Date(Date.now() + 9*3600e3).toISOString().replace("T"," ").slice(0,19);
const uniq = (a) => [...new Set(a)];
const all = (s, re) => uniq((s.match(re) ?? []).map(x => x.replace(/\s+/g, "")));

const RE_ASOF   = /(20\d{2}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?\s*(?:時点|現在|調べ|確認))/g;
const RE_CAVEAT = /(最新は公式|公式サイトでご確認|公式サイトで最新|変更されうる|変更される場合|最新の情報は|最新情報は公式)/g;
const RE_TIMEBOUND = {
  価格:     /(?:¥|￥)?\s?[0-9][0-9,]{1,6}\s?円/g,
  割引率:   /\d{1,3}\s?[%％]\s?(?:OFF|オフ|割引)/gi,
  作品本数: /[0-9][0-9,]{2,}\s?(?:本|作品|タイトル)/g,
  期限:     /(?:\d{1,2}\s*月\s*\d{1,2}\s*日\s*まで|期間限定|キャンペーン中|今だけ|終了予定)/g,
  無料日数: /\d{1,2}\s?日間?\s?(?:無料|お試し|トライアル)/g,
  クーポン: /(?:クーポン|初回限定|新規登録特典)/g,
};
const RE_SUPERLATIVE = /(国内最大級|業界最大級|日本最大級|最大級|No\.?\s?1|NO\.?\s?1|ナンバーワン|最安|絶対|必ず)/gi;

const textOf = (h) => h
  .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#8217;|&#039;|&#39;/g, "'").replace(/&#8211;|&#8212;/g, "-")
  .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#\d+;/g, "")
  .replace(/\s+/g, " ").trim();

async function fetchAll(kind) {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const u = `https://moterist.com/wp-json/wp/v2/${kind}?per_page=20&page=${page}&_fields=id,slug,link,date,modified,title,content,categories,tags`;
    const r = await fetch(u, { headers: { "user-agent": UA } });
    if (r.status !== 200) break;
    const j = await r.json();
    if (!Array.isArray(j) || j.length === 0) break;
    out.push(...j);
    await sleep(800);
    if (j.length < 20) break;
  }
  return out;
}

console.log(`=== moterist REST 監査 v2 開始 ${jst()} JST ===`);
const posts = await fetchAll("posts");
const pages = await fetchAll("pages");
console.log(`取得: posts ${posts.length} / pages ${pages.length}`);

const rows = [];
for (const p of [...posts.map(x=>({...x,kind:"post"})), ...pages.map(x=>({...x,kind:"page"}))]) {
  const html = p.content?.rendered ?? "";
  const text = textOf(html);
  const timebound = {};
  for (const [k, re] of Object.entries(RE_TIMEBOUND)) timebound[k] = all(text, re).slice(0, 10);
  const tbCount = Object.values(timebound).reduce((n,v)=>n+v.length, 0);

  const hrefs = uniq([...html.matchAll(/href="([^"]+)"/gi)].map(m => m[1]));
  const internal = uniq(hrefs
    .filter(h => /^https?:\/\/(www\.)?moterist\.com/i.test(h) || /^\//.test(h))
    .map(h => (h.startsWith("/") ? `https://moterist.com${h}` : h).replace(/^https:\/\/www\./,"https://").replace(/\/$/,""))
    .filter(h => !/\/wp-(content|admin|json)|#/i.test(h)));

  rows.push({
    kind: p.kind, id: p.id, slug: p.slug, link: p.link,
    title: textOf(p.title?.rendered ?? ""),
    date: p.date, modified: p.modified,
    chars: text.length,
    asOf: all(text, RE_ASOF),
    caveat: all(text, RE_CAVEAT),
    timebound, tbCount,
    superlative: all(text, RE_SUPERLATIVE),
    internalOut: internal.filter(h => h !== p.link.replace(/\/$/,"")),
    toApp: uniq(hrefs.filter(h => /app\.vodnavi\.jp/i.test(h))),
    toVodnavi: uniq(hrefs.filter(h => /(^|\/\/)(www\.)?vodnavi\.jp/i.test(h) && !/app\./i.test(h))),
    affilCount: hrefs.filter(h => /al\.(dmm|fanza)\.co\.jp/i.test(h)).length,
    af001: (html.match(/af_id=moterist-001/g) ?? []).length,
    af99x: (html.match(/af_id=moterist-99\d/g) ?? []).length,
  });
}

const stamp = new Date(Date.now()+9*3600e3).toISOString().replace(/[-:T]/g,"").slice(0,13);
writeFileSync(`${DIR}/audit2-${stamp}.json`, JSON.stringify({ generated_jst: jst(), n: rows.length, rows }, null, 2), "utf8");

// ── 集計 ────────────────────────────────────────────────────────────
const n = rows.length;
console.log(`\n=== A(1) 時点注記の棚卸し（本文のみ・n=${n}） ===`);
const withAsOf = rows.filter(r => r.asOf.length > 0);
const withCaveat = rows.filter(r => r.caveat.length > 0);
const tb = rows.filter(r => r.tbCount > 0);
const tbNoAsOf = rows.filter(r => r.tbCount > 0 && r.asOf.length === 0);
console.log(`本文に時点注記（◯年◯月時点/現在/確認）がある : ${withAsOf.length} / ${n}`);
console.log(`本文に但し書き（最新は公式で 等）がある        : ${withCaveat.length} / ${n}`);
console.log(`本文に時点依存の記述がある                    : ${tb.length} / ${n}`);
console.log(`★ 時点依存の記述はあるが本文に時点注記が無い  : ${tbNoAsOf.length} / ${n}`);
if (withAsOf.length) console.log("  時点注記の実値: " + uniq(withAsOf.flatMap(r=>r.asOf)).join(" / "));
console.log("\n  時点依存の記述の内訳（該当ページ数）:");
for (const k of Object.keys(RE_TIMEBOUND)) {
  const c = rows.filter(r => r.timebound[k].length > 0).length;
  const vals = uniq(rows.flatMap(r => r.timebound[k])).slice(0, 12);
  console.log(`   ${k.padEnd(5)}: ${String(c).padStart(3)} ページ  例: ${vals.join(" , ") || "—"}`);
}

console.log(`\n=== 比較の主張（§25-6-1） ===`);
const sup = rows.filter(r => r.superlative.length > 0);
console.log(`本文に比較の主張を含む: ${sup.length} / ${n}`);
uniq(sup.flatMap(r=>r.superlative)).forEach(s =>
  console.log(`  「${s}」: ${sup.filter(r=>r.superlative.includes(s)).length} ページ`));

console.log(`\n=== 更新日の分布（REST の modified） ===`);
const byYear = {}, byYm = {};
rows.forEach(r => { const y = r.modified.slice(0,4); byYear[y]=(byYear[y]||0)+1; const ym=r.modified.slice(0,7); byYm[ym]=(byYm[ym]||0)+1; });
Object.entries(byYear).sort().forEach(([y,c]) => console.log(`  ${y}: ${c} ページ`));
console.log("  年月別:");
Object.entries(byYm).sort().forEach(([y,c]) => console.log(`    ${y}: ${c}`));
console.log(`  最古の modified: ${rows.map(r=>r.modified).sort()[0]}`);
console.log(`  最新の modified: ${rows.map(r=>r.modified).sort().at(-1)}`);

console.log(`\n=== A(3) 内部リンク構造（本文内のみ） ===`);
const outs = rows.map(r=>r.internalOut.length).sort((a,b)=>a-b);
console.log(`出次数 合計:${outs.reduce((a,b)=>a+b,0)} 中央値:${outs[Math.floor(outs.length/2)]} 最大:${outs.at(-1)} 0本:${outs.filter(x=>x===0).length} ページ`);
const inDeg = {};
rows.forEach(r => r.internalOut.forEach(h => { inDeg[h]=(inDeg[h]||0)+1; }));
console.log("被リンク上位15（本文内）:");
Object.entries(inDeg).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([u,c]) => console.log(`  ${String(c).padStart(3)}  ${decodeURIComponent(u)}`));
const orphans = rows.filter(r => !inDeg[r.link.replace(/\/$/,"")]);
console.log(`★ 本文内リンクを1本も受けていないページ: ${orphans.length} / ${n}`);
orphans.forEach(r => console.log(`     ${r.link}  (${r.title.slice(0,40)})`));

console.log(`\n=== moterist → app / vodnavi の導線 と af_id ===`);
console.log(`app.vodnavi.jp へのリンクを持つページ: ${rows.filter(r=>r.toApp.length>0).length} / ${n}`);
console.log(`vodnavi.jp（apex/www）へのリンク      : ${rows.filter(r=>r.toVodnavi.length>0).length} / ${n}`);
console.log(`al.dmm / al.fanza 直リンク 総数       : ${rows.reduce((a,r)=>a+r.affilCount,0)}`);
console.log(`本文内 af_id=moterist-001 総数        : ${rows.reduce((a,r)=>a+r.af001,0)}`);
console.log(`★ 本文内 af_id=moterist-99x 総数      : ${rows.reduce((a,r)=>a+r.af99x,0)}`);

console.log(`\n=== 記事の分類（slug から機械的に） ===`);
const guide = rows.filter(r => /^fanza|guide|otoiawase|sitemap|privacy|about/.test(r.slug));
console.log(`ガイド系/固定ページ候補: ${guide.length} 件`);
guide.forEach(r => console.log(`  [${r.kind}] ${r.modified.slice(0,10)}  ${r.slug}  ${r.title.slice(0,40)}  (内部出:${r.internalOut.length} app:${r.toApp.length})`));
const actress = rows.filter(r => !guide.includes(r));
console.log(`女優レビュー系候補: ${actress.length} 件（内部出リンクの中央値 ${actress.map(r=>r.internalOut.length).sort((a,b)=>a-b)[Math.floor(actress.length/2)]}）`);
