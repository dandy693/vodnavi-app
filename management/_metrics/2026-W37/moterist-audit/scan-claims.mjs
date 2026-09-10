/**
 * moterist.com — 比較の主張の再走査（固有名詞を除外して数え直す）
 *
 * 【v2 の粗さの訂正】v2 は「ナンバーワン / NO.1」を 16ページで検出したが、
 *   その大半は __固有名詞__ である——メーカー名「エスワン ナンバーワンスタイル」
 *   （S1 NO.1 STYLE）と作品タイトル「新人NO.1STYLE …」。
 *   本スクリプトは固有名詞を除外し、__比較の主張として書かれているもの__だけを数える。
 *
 * 【厳守】読み取りのみ。評価は書かない。分類は機械的なパターン一致であり、
 *   「誇大表現かどうか」の判定は CSO 枠である。
 */
const UA = { headers: { "user-agent": "Mozilla/5.0" } };
const txt = (h) => h
  .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ")
  .replace(/&#8217;|&#039;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
  .replace(/&#\d+;/g, "").replace(/\s+/g, " ").trim();

// 固有名詞（除外対象）
const PROPER = [
  /エスワン\s*ナンバーワンスタイル/g,
  /(?:新人)?\s*NO\.?\s?1\s*STYLE/gi,
  /S1\s*NO\.?\s?1/gi,
];
// 比較の主張として数えるもの
const CLAIMS = {
  "国内No1/国内最大級系": /(国内\s?No\.?\s?1|国内最大級|業界最大級|日本最大級|業界\s?No\.?\s?1|最大級)/gi,
  "最安/最高峰":          /(最安|業界最安|最高峰|最高級)/g,
  "絶対":                 /絶対/g,
  "必ず":                 /必ず/g,
  "誰でも/100%":          /(誰でも|どんな人でも|100\s?[%％])/g,
};

const list = await (await fetch("https://moterist.com/wp-json/wp/v2/posts?per_page=100&_fields=slug", UA)).json();
const slugs = list.map((x) => x.slug);
console.log(`=== 比較の主張の再走査 / n=${slugs.length} ===\n`);

const hits = {}; for (const k of Object.keys(CLAIMS)) hits[k] = [];
const boiler = [];

for (const s of slugs) {
  const j = await (await fetch(`https://moterist.com/wp-json/wp/v2/posts?slug=${s}&_fields=slug,content,modified`, UA)).json();
  if (!j[0]) continue;
  let t = txt(j[0].content.rendered);
  const mod = j[0].modified.slice(0, 10);
  // 固有名詞をマスクしてから数える
  let masked = t;
  for (const re of PROPER) masked = masked.replace(re, " ");
  for (const [k, re] of Object.entries(CLAIMS)) {
    const m = masked.match(re);
    if (m) hits[k].push({ slug: s, mod, n: m.length, samples: [...new Set(m)].slice(0, 3) });
  }
  // FANZA 定型バナー文（「【FANZA(ファンザ)】では、…の品ぞろえで」）
  const b = t.match(/【FANZA\(ファンザ\)】\s*では、[^。]{0,60}/g);
  if (b) boiler.push({ slug: s, mod, texts: [...new Set(b)] });
  await new Promise((r) => setTimeout(r, 700));
}

for (const [k, arr] of Object.entries(hits)) {
  console.log(`\n--- ${k} : ${arr.length} ページ / 延べ ${arr.reduce((a, x) => a + x.n, 0)} 箇所 ---`);
  arr.forEach((x) => console.log(`  ${x.mod}  ${x.slug.padEnd(22)} ${x.n}回  ${x.samples.join(" , ")}`));
}

console.log(`\n\n=== FANZA 定型バナー文（「【FANZA(ファンザ)】では、…」）: ${boiler.length} ページ ===`);
const variants = {};
boiler.forEach((b) => b.texts.forEach((t) => { variants[t] = (variants[t] || 0) + 1; }));
Object.entries(variants).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${String(c).padStart(3)}  ${t}`));
