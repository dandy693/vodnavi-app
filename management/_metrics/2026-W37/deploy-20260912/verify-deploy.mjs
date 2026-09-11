/**
 * デプロイ便（E14 + fix/number-readability 3本）の本番機械検証 — RUNBOOK §4-2「デプロイ後」
 * 【厳守】読み取りのみ。判定文は書かない。「読みやすくなった」は CTO が判定しない（ひでき目視が正）。
 */
const jst = () => new Date(Date.now()+9*3600e3).toISOString().replace("T"," ").slice(0,19)+" JST";
const UA = { headers: { "user-agent": "Mozilla/5.0 (verify-deploy 2026-09-12)" } };
const get = async (p) => { const r = await fetch("https://app.vodnavi.jp"+p, UA); return { status: r.status, html: await r.text(), cache: r.headers.get("x-vercel-cache"), age: r.headers.get("age") }; };
const count = (s, re) => (s.match(re) ?? []).length;
console.log("verify-deploy 開始:", jst());

const faces = { "/": null, "/sale": null, "/genres/6925": null, "/actresses/1012507": null, "/age-gate": null, "/lp": null, "/concierge": null };
for (const p of Object.keys(faces)) faces[p] = await get(p);

// works 詳細: トップから1件拾う
const w = faces["/"].html.match(/href="(\/works\/[a-z]+\/[a-z0-9]+)"/)?.[1];
const work = w ? await get(w) : null;
console.log("works 詳細の検査 URL:", w, "→", work?.status);

const out = [];
const row = (item, val, note="") => out.push(`| ${item} | ${val} | ${note} |`);

for (const [p, r] of Object.entries(faces)) {
  const yenComma = count(r.html, /¥[0-9]{1,3}(,[0-9]{3})+/g);
  const yenNoComma4 = count(r.html, /¥[0-9]{4,}/g);
  const tildeDup = count(r.html, /~〜|〜~/g);
  const tnum = count(r.html, /tabular-nums/g);
  const af99 = count(r.html, /href="[^"]*moterist-99[0-9][^"]*"/g);
  row(`${p} (HTTP ${r.status} / ${r.cache})`, `¥カンマ付き ${yenComma} / ¥4桁以上カンマ無し ${yenNoComma4} / ~〜連続 ${tildeDup} / tabular-nums ${tnum} / af_id 99x(href) ${af99}`);
}
if (work) {
  const r = work;
  row(`${w} (HTTP ${r.status} / ${r.cache})`, `¥カンマ付き ${count(r.html,/¥[0-9]{1,3}(,[0-9]{3})+/g)} / ¥4桁以上カンマ無し ${count(r.html,/¥[0-9]{4,}/g)} / ~〜連続 ${count(r.html,/~〜|〜~/g)} / tabular-nums ${count(r.html,/tabular-nums/g)} / af_id 99x(href) ${count(r.html,/href="[^"]*moterist-99[0-9][^"]*"/g)}`);
  // sticky labels
  row("sticky メインラベル「FANZA公式へ（18禁）」", count(r.html,/FANZA公式へ（18禁）/g), "works 詳細 HTML 内の出現数");
  row("sticky サブ「コンシェルジュに相談」/「コンシェルジュ」", `${count(r.html,/コンシェルジュに相談/g)} / ${count(r.html,/>コンシェルジュ</g)}`, "出し分けは CSS（min-[360px]）。両方 HTML に存在するのが正");
  row("旧ラベル「今宵ひらく」/「司書に相談」", `${count(r.html,/今宵ひらく/g)} / ${count(r.html,/司書に相談/g)}`, "0 / 0 が正");
  const sub = r.html.match(/href="(\/concierge\?source=app_direct[^"]*)"/)?.[1];
  row("sticky サブ href", sub ?? "（未検出）", "`/concierge?source=app_direct&intent=actress&seed_cid=…` が正");
  const main = r.html.match(/href="(https:\/\/al\.dmm\.co\.jp\/[^"]*)"/)?.[1];
  row("メイン CTA href の host / af_id", main ? `${new URL(main.replace(/&amp;/g,"&")).host} / ${(main.match(/af_id=([a-z0-9-]+)/)||[])[1]}` : "（未検出）", "al.dmm.co.jp / moterist-004 が正");
}
// 年齢確認の文言
const ag = faces["/age-gate"].html;
row("年齢確認の文言", ["18 歳以上ですか？","はい、18 歳以上です","いいえ（退出）"].map(t=>`${t}: ${count(ag, new RegExp(t.replace(/[（）？]/g, m=>"\\"+m),"g"))}`).join(" / "), "各1以上が正（一字も変えていない）");
// CSS: lining-nums / /80 小注
const cssUrls = [...new Set([...faces["/age-gate"].html.matchAll(/href="(\/_next\/static\/css\/[^"]+\.css)"/g)].map(m=>m[1]))];
let css = ""; for (const u of cssUrls) css += (await get(u)).html;
row("CSS: `font-variant-numeric:lining-nums` の出現", count(css,/font-variant-numeric:\s*lining-nums/g), `css ${cssUrls.length} 本・${css.length} bytes`);
row("CSS: `.font-luxury-heading` に lining-nums", /\.font-luxury-heading[^{}]*\{[^}]*lining-nums/.test(css) ? "あり" : "なし");
row("CSS: `.btn-luxury-gold` に lining-nums", /\.btn-luxury-gold[^{}]*\{[^}]*lining-nums/.test(css) ? "あり" : "なし");
row("age-gate 小注の不透明度クラス", `text-brand-text-secondary\/80: ${count(ag,/text-brand-text-secondary\/80/g)} / \/70: ${count(ag,/text-brand-text-secondary\/70/g)}`, "/80 が正・/70 は 0 が正");
// sitemap
const sm = await get("/sitemap.xml");
const lm = sm.html.match(/<lastmod>([^<]+)/)?.[1];
row("sitemap root lastmod", lm ?? "（未検出）", `loc ${count(sm.html,/<loc>/g)} / works ${count(sm.html,/\/works\//g)} / articles ${count(sm.html,/\/articles\//g)}`);

console.log("\n| 項目 | 実測 | 備考 |\n|---|---|---|\n" + out.join("\n"));
console.log("\nverify-deploy 終了:", jst());
