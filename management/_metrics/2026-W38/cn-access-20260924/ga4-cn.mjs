// 中国発アクセスの切り分け（CSO 指示 2026-09-25・read-only・数字のみ）。GA4 Data API（p489519780・§3）。
import fs from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(fs.readFileSync("app-concierge/ga4-service-account.json", "utf8"));
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const h = b({ alg: "RS256", typ: "JWT" }), c = b({ iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
const s = createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${h}.${c}.${s.sign(KEY.private_key, "base64url")}` }) })).json()).access_token;
const run = async (body) => { const j = await (await fetch("https://analyticsdata.googleapis.com/v1beta/properties/489519780:runReport", { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) })).json(); if (j.error) throw new Error(JSON.stringify(j.error)); return (j.rows ?? []).map((r) => [...(r.dimensionValues ?? []).map((x) => x.value), ...r.metricValues.map((x) => x.value)]); };
const R30 = [{ startDate: "30daysAgo", endDate: "today" }];
const M = [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }, { name: "engagementRate" }, { name: "averageSessionDuration" }];
const ctry = (code) => ({ filter: { fieldName: "countryId", stringFilter: { matchType: "EXACT", value: code } } });
const out = { fetched_at: new Date().toISOString(), note: "全ホスト（hostName 無条件）。当日・前日は処理遅延で未確定（§6-1）" };
out.by_country = await run({ dateRanges: R30, dimensions: [{ name: "country" }, { name: "countryId" }], metrics: M, orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
out.total = await run({ dateRanges: R30, metrics: M });
out.cn_daily = await run({ dateRanges: [{ startDate: "2026-09-01", endDate: "today" }], dimensions: [{ name: "date" }], metrics: M, dimensionFilter: ctry("CN"), orderBys: [{ dimension: { dimensionName: "date" } }], limit: 100 });
out.jp_daily = await run({ dateRanges: [{ startDate: "2026-09-01", endDate: "today" }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], dimensionFilter: ctry("JP"), orderBys: [{ dimension: { dimensionName: "date" } }], limit: 100 });
for (const cc of ["CN", "JP"]) {
  out[cc + "_landing"] = await run({ dateRanges: R30, dimensions: [{ name: "landingPage" }], metrics: M, dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
  out[cc + "_host"] = await run({ dateRanges: R30, dimensions: [{ name: "hostName" }], metrics: M, dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
  out[cc + "_source"] = await run({ dateRanges: R30, dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: M, dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
  out[cc + "_city"] = await run({ dateRanges: R30, dimensions: [{ name: "city" }], metrics: [{ name: "sessions" }], dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 });
  out[cc + "_device"] = await run({ dateRanges: R30, dimensions: [{ name: "deviceCategory" }, { name: "browser" }, { name: "operatingSystem" }], metrics: [{ name: "sessions" }], dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 6 });
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log("ok", out.fetched_at);
