/**
 * GA4 Data API — ホスト名別の実績（第122便 補遺2(4) / W裁定材料）
 *
 * 【裁定4 準拠】management/ 配下（git 管理）に置く。
 * 【厳守】読み取り専用。鍵は §3 のとおり CTO ローカルバッチ専用で Vercel env へは投入しない。
 * 【厳守】鍵の値は出力しない。
 */
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json", "utf8"));
const PROPERTY = "489519780"; // vodnavi.jp（app + www + moterist 横断・§3）

const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u({ alg: "RS256", typ: "JWT" });
  const c = b64u({
    iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
  });
  const s = createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
  const jwt = `${h}.${c}.${s.sign(KEY.private_key, "base64url")}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("token 取得失敗: " + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

const tok = await token();
const run = async (body) => {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
};

const START = "2026-06-07", END = "2026-09-06"; // GSC の90日窓と揃える
console.log(`=== GA4 プロパティ ${PROPERTY} / ${START}〜${END}（GSC の90日窓と同期間）===\n`);

const j = await run({
  dateRanges: [{ startDate: START, endDate: END }],
  dimensions: [{ name: "hostName" }],
  metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 20,
});
if (j.error) { console.log("エラー:", JSON.stringify(j.error).slice(0, 300)); process.exit(1); }
console.log("| hostName | アクティブユーザー | セッション | ページビュー |");
console.log("|---|---|---|---|");
let tu = 0, ts = 0, tp = 0;
for (const r of j.rows ?? []) {
  const [u, s, p] = r.metricValues.map((m) => Number(m.value));
  tu += u; ts += s; tp += p;
  console.log(`| \`${r.dimensionValues[0].value}\` | ${u.toLocaleString()} | ${s.toLocaleString()} | ${p.toLocaleString()} |`);
}
console.log(`| **合計** | **${tu.toLocaleString()}** | **${ts.toLocaleString()}** | **${tp.toLocaleString()}** |`);

// 直近30日も（第122便 補遺1(2) の「直近30日」に対応）
const j2 = await run({
  dateRanges: [{ startDate: "2026-08-11", endDate: "2026-09-09" }],
  dimensions: [{ name: "hostName" }],
  metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
  orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  limit: 20,
});
console.log(`\n=== 直近30日（2026-08-11〜09-09）===`);
console.log("| hostName | アクティブユーザー | ページビュー |");
console.log("|---|---|---|");
for (const r of j2.rows ?? []) {
  const [u, p] = r.metricValues.map((m) => Number(m.value));
  console.log(`| \`${r.dimensionValues[0].value}\` | ${u.toLocaleString()} | ${p.toLocaleString()} |`);
}

// 処理済み最終日（§6-1 の鮮度確認）
const j3 = await run({
  dateRanges: [{ startDate: "2026-09-01", endDate: "2026-09-10" }],
  dimensions: [{ name: "date" }], metrics: [{ name: "activeUsers" }],
  orderBys: [{ dimension: { dimensionName: "date" }, desc: true }], limit: 3,
});
console.log(`\n=== 処理済み最終日（§6-1 の鮮度確認）===`);
for (const r of j3.rows ?? []) console.log(`  ${r.dimensionValues[0].value} : activeUsers ${r.metricValues[0].value}`);
