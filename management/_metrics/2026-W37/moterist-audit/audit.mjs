/**
 * moterist.com 監査 — 第122便 A(1) 時点注記の棚卸し / A(3) 内部リンク構造
 *
 * 【厳守】読み取りのみ。moterist への書き込みは一切しない。
 * 【厳守】逐次・1件 1200ms。悉皆だが 55件であり §24-4(5) の「悉皆検査(477件級)の禁止」には当たらない
 *         （あれは app.vodnavi.jp の works 面に対する規定）。
 * 【厳守】本スクリプトは事実の抽出のみを行う。評価・提案は書かない。
 *
 * 使い方: node management/_metrics/2026-W37/moterist-audit/audit.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "management/_metrics/2026-W37/moterist-audit";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const GAP_MS = 1200;
const urls = readFileSync(`${DIR}/urls.txt`, "utf8").split(/\r?\n/).filter(Boolean);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jst = () => new Date(Date.now() + 9*3600e3).toISOString().replace("T"," ").slice(0,19);

// ── A(1) 時点注記のパターン ───────────────────────────────────────────
// 「2026年7月時点」「2025年1月現在」等の“いつの情報か”を示す表現
const RE_ASOF   = /(20\d{2}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?\s*(?:時点|現在|調べ|確認))/g;
// 時点注記の定型（「最新は公式で」等の但し書き）
const RE_CAVEAT = /(最新は公式|公式サイトでご確認|変更されうる|変更される場合|最新の情報は)/g;
// 時点依存の記述（注記が無いと古くなる種類の内容）
const RE_TIMEBOUND = {
  価格:      /(¥|￥)?\s?[0-9][0-9,]{1,6}\s?円/g,
  割引率:    /\d{1,3}\s?[%％]\s?(?:OFF|オフ|割引)/gi,
  作品本数:  /[0-9][0-9,]{2,}\s?(?:本|作品|タイトル)/g,
  期限:      /(?:\d{1,2}\s*月\s*\d{1,2}\s*日\s*まで|期間限定|キャンペーン中|今だけ)/g,
  無料日数:  /\d{1,2}\s?日間?\s?(?:無料|お試し|トライアル)/g,
};
// 「国内最大級」等の比較の主張（§25-6-1）
const RE_SUPERLATIVE = /(国内最大級|業界最大級|日本最大級|最大級|No\.?\s?1|ナンバーワン|最安|業界No)/gi;

const norm = (h) => h
  .replace(/&#8217;|&#039;|&#39;/g, "'").replace(/&#8211;|&#8212;/g, "-")
  .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"');

// 本文だけを見る（ヘッダ/フッタ/サイドバーの定型を除く）。THE THOR は article タグを持つ。
function bodyOf(html) {
  const m = html.match(/<article[\s\S]*?<\/article>/i);
  const seg = m ? m[0] : html;
  return norm(seg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, ""));
}
const textOf = (seg) => seg.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const uniq = (a) => [...new Set(a)];
const all = (s, re) => uniq((s.match(re) ?? []).map(x => x.replace(/\s+/g, "")));

const rows = [];
console.log(`=== moterist.com 監査 開始 ${jst()} JST / n=${urls.length} ===`);

for (const url of urls) {
  let html = "", status = null, bytes = 0;
  try {
    const r = await fetch(url, { headers: { "user-agent": UA } });
    status = r.status; html = await r.text(); bytes = Buffer.byteLength(html);
  } catch (e) { status = null; }
  await sleep(GAP_MS);
  if (!html) { rows.push({ url, status, bytes, error: true }); console.log(`★ ${status} ${url}`); continue; }

  const body = bodyOf(html);
  const text = textOf(body);
  const head = norm(html);

  // 更新日 / 公開日
  const pub = head.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i)?.[1] ?? null;
  const mod = head.match(/<meta[^>]+property="article:modified_time"[^>]+content="([^"]+)"/i)?.[1] ?? null;
  const title = norm(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();

  // A(1) 時点注記
  const asOf    = all(text, RE_ASOF);
  const caveat  = all(text, RE_CAVEAT);
  const timebound = {};
  for (const [k, re] of Object.entries(RE_TIMEBOUND)) timebound[k] = all(text, re).slice(0, 8);
  const timeboundCount = Object.values(timebound).reduce((n, v) => n + v.length, 0);
  const superlative = all(text, RE_SUPERLATIVE);

  // A(3) 内部リンク構造（本文内の a href のみ。ヘッダ/フッタは article 外なので除かれる）
  const hrefs = uniq([...body.matchAll(/href="([^"]+)"/gi)].map(m => m[1]));
  const internal = hrefs.filter(h => /^https?:\/\/(www\.)?moterist\.com/i.test(h) || /^\//.test(h))
                        .map(h => h.startsWith("/") ? `https://moterist.com${h}` : h)
                        .map(h => h.replace(/^https:\/\/www\./, "https://"))
                        .filter(h => !/\/wp-(content|admin|json)|#|\.(jpg|png|webp|gif|css|js)$/i.test(h));
  const toApp   = hrefs.filter(h => /app\.vodnavi\.jp/i.test(h));
  const toVod   = hrefs.filter(h => /(^|\/\/)(www\.)?vodnavi\.jp/i.test(h));
  const toAffil = hrefs.filter(h => /al\.(dmm|fanza)\.co\.jp/i.test(h));

  rows.push({
    url, status, bytes, title, published: pub, modified: mod,
    asOf, caveat, timebound, timeboundCount, superlative,
    internalOut: uniq(internal).filter(h => h.replace(/\/$/,"") !== url.replace(/\/$/,"")),
    toApp: uniq(toApp), toVod: uniq(toVod), toAffilCount: toAffil.length,
  });
  console.log(`${status} ${String(bytes).padStart(7)}B  時点注記:${asOf.length} 但書:${caveat.length} 時点依存:${timeboundCount} 比較主張:${superlative.length} 内部:${uniq(internal).length} app:${uniq(toApp).length}  ${url}`);
}

writeFileSync(`${DIR}/audit-${new Date(Date.now()+9*3600e3).toISOString().replace(/[-:T]/g,"").slice(0,13)}.json`,
  JSON.stringify({ generated_jst: jst(), n: rows.length, rows }, null, 2), "utf8");

// ── 集計 ────────────────────────────────────────────────────────────
const ok = rows.filter(r => r.status === 200);
console.log(`\n=== 集計（HTTP 200 = ${ok.length} / ${rows.length}） ===`);

console.log("\n--- A(1) 時点注記 ---");
const withAsOf = ok.filter(r => r.asOf.length > 0);
const withCaveat = ok.filter(r => r.caveat.length > 0);
const tbNoAsOf = ok.filter(r => r.timeboundCount > 0 && r.asOf.length === 0);
console.log(`時点注記（「◯年◯月時点/現在」）を持つ: ${withAsOf.length} / ${ok.length}`);
console.log(`但し書き（「最新は公式で」等）を持つ  : ${withCaveat.length} / ${ok.length}`);
console.log(`時点依存の記述を持つ                  : ${ok.filter(r=>r.timeboundCount>0).length} / ${ok.length}`);
console.log(`★ 時点依存の記述はあるが時点注記が無い: ${tbNoAsOf.length} / ${ok.length}`);
if (withAsOf.length) {
  console.log("  時点注記の実値（出現順・重複除去）:");
  console.log("   " + uniq(withAsOf.flatMap(r => r.asOf)).join(" / "));
}

console.log("\n--- 比較の主張（§25-6-1・「国内最大級」等） ---");
const sup = ok.filter(r => r.superlative.length > 0);
console.log(`本文に比較の主張を含むページ: ${sup.length} / ${ok.length}`);
uniq(sup.flatMap(r => r.superlative)).forEach(s => {
  console.log(`  「${s}」 : ${sup.filter(r => r.superlative.includes(s)).length} ページ`);
});

console.log("\n--- 更新日の分布（article:modified_time の年） ---");
const yr = {};
ok.forEach(r => { const y = (r.modified ?? r.published ?? "unknown").slice(0,4); yr[y] = (yr[y]||0)+1; });
Object.entries(yr).sort().forEach(([y,n]) => console.log(`  ${y}: ${n} ページ`));

console.log("\n--- A(3) 内部リンク構造 ---");
const inDeg = {};
ok.forEach(r => r.internalOut.forEach(h => { const k = h.replace(/\/$/,""); inDeg[k] = (inDeg[k]||0)+1; }));
const outStats = ok.map(r => r.internalOut.length).sort((a,b)=>a-b);
console.log(`本文内リンク（出次数） 合計:${outStats.reduce((a,b)=>a+b,0)} 中央値:${outStats[Math.floor(outStats.length/2)]} 最大:${outStats.at(-1)} 0本のページ:${outStats.filter(x=>x===0).length}`);
console.log("被リンク上位10（本文内・moterist 内部）:");
Object.entries(inDeg).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([u,n]) => console.log(`  ${String(n).padStart(3)}  ${u}`));
const orphan = ok.filter(r => !inDeg[r.url.replace(/\/$/,"")]);
console.log(`★ 本文内リンクを1本も受けていないページ: ${orphan.length} / ${ok.length}`);
orphan.slice(0,20).forEach(r => console.log(`     ${r.url}`));

console.log("\n--- moterist → app / vodnavi への導線 ---");
console.log(`app.vodnavi.jp へのリンクを持つページ : ${ok.filter(r=>r.toApp.length>0).length} / ${ok.length}`);
console.log(`vodnavi.jp（apex/www）へのリンク      : ${ok.filter(r=>r.toVod.length>0).length} / ${ok.length}`);
console.log(`al.dmm / al.fanza 直リンク総数        : ${ok.reduce((n,r)=>n+r.toAffilCount,0)}`);
