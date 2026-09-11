/**
 * Cormorant 使用要素の computed 悉皆検査 — RUNBOOK §4-2（push 前・ローカルビルド／デプロイ後・本番）
 *
 * 使い方: node cormorant-audit.mjs <baseUrl>   例: http://localhost:3123 / https://app.vodnavi.jp
 * 判定: computed font-family に "Cormorant" を含み、テキストを持つ要素のうち
 *       computed font-variant-numeric が "lining-nums" を含まないものが 0 件であること。
 * 【厳守】読み取りのみ。年齢確認はローカル cookie で通過する（本番でも同じ cookie 名）。
 */
// playwright-core は npx キャッシュから解決する（本リポジトリに依存を追加しない）
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const PW = process.env.PW_CORE ?? "C:/Users/Tachi/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright-core";
const { chromium } = require(PW);
const base = process.argv[2] ?? "http://localhost:3123";
const PAGES = ["/", "/sale", "/genres/6925", "/actresses/1012507", "/age-gate", "/lp", "/concierge", "/articles/fanza-tv-review"];
const jst = () => new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19) + " JST";
const browser = await chromium.launch({ executablePath: process.env.PW_CHROME ?? "C:/Users/Tachi/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 1288, height: 951 } });
const host = new URL(base).hostname;
await ctx.addCookies([{ name: "vodnavi_age_verified", value: "1", domain: host, path: "/" }]);
const page = await ctx.newPage();
// works 詳細はトップから1件拾う
await page.goto(base + "/", { waitUntil: "networkidle" });
const work = await page.evaluate(() => document.querySelector('a[href^="/works/"]')?.getAttribute("href"));
if (work) PAGES.push(work);
console.log(`cormorant-audit ${base} 開始: ${jst()}`);
let bad = 0, total = 0;
for (const p of PAGES) {
  await page.goto(base + p, { waitUntil: "networkidle" });
  const r = await page.evaluate(async () => {
    await document.fonts.ready;
    const els = [...document.querySelectorAll("body *")].filter(el => el.textContent.trim().length > 0 && /Cormorant/i.test(getComputedStyle(el).fontFamily));
    const groups = {};
    for (const el of els) {
      const cs = getComputedStyle(el);
      const key = el.tagName.toLowerCase() + "." + [...el.classList].filter(c => /^(font-|btn-|tabular)/.test(c)).join(".");
      const ok = /lining-nums/.test(cs.fontVariantNumeric);
      groups[key] ??= { n: 0, ok: 0, sample: el.textContent.trim().slice(0, 24) };
      groups[key].n++; if (ok) groups[key].ok++;
    }
    return { total: els.length, groups };
  });
  const rows = Object.entries(r.groups);
  const ng = rows.filter(([, g]) => g.ok < g.n);
  total += r.total; bad += ng.reduce((a, [, g]) => a + (g.n - g.ok), 0);
  console.log(`\n## ${p}  Cormorant 要素 ${r.total} 件 / lining-nums 未適用 ${ng.reduce((a, [, g]) => a + (g.n - g.ok), 0)} 件`);
  for (const [k, g] of rows) console.log(`  ${g.ok === g.n ? "OK " : "NG "} ${k}  n=${g.n} ok=${g.ok}  「${g.sample}」`);
}
console.log(`\n合計: Cormorant 要素 ${total} 件 / lining-nums 未適用 ${bad} 件 → ${bad === 0 ? "PASS" : "FAIL"}`);
console.log(`終了: ${jst()}`);
await browser.close();
process.exit(bad === 0 ? 0 : 1);
