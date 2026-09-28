/**
 * GA4 Data API — 中国発アクセスの works 面拡大と DMM クリック急増の切り分け（チャット便 2026-09-28・read-only）
 * 期間 2026-09-20〜09-28・日別・プロパティ 489519780（タイムゾーン Asia/Tokyo＝§3）
 * 外部クリックの定義は ga4-access-20260921.mjs と同一:
 *   ① product_click（明示計装・placement 付き）
 *   ② click（拡張計測 outbound）かつ linkDomain ∈ {al.dmm.co.jp, al.fanza.co.jp}
 * CN を除外しない（本調査の対象のため）。hostName=app.vodnavi.jp。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json", "utf8"));
const PROPERTY = "489519780";
const R = { startDate: "2026-09-20", endDate: "2026-09-28" };
const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u({ alg: "RS256", typ: "JWT" });
  const c = b64u({ iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
  const s = createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${h}.${c}.${s.sign(KEY.private_key, "base64url")}` }) });
  const j = await r.json(); if (!j.access_token) throw new Error("token"); return j.access_token;
}
const tok = await token();
const run = async (body) => {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json(); if (j.error) throw new Error(JSON.stringify(j.error).slice(0, 300));
  return (j.rows ?? []).map((x) => [...x.dimensionValues.map((v) => v.value), ...x.metricValues.map((v) => Number(v.value))]);
};
const eq = (f, v) => ({ filter: { fieldName: f, stringFilter: { matchType: "EXACT", value: v } } });
const inList = (f, v) => ({ filter: { fieldName: f, inListFilter: { values: v } } });
const and = (...e) => ({ andGroup: { expressions: e } });
const HOST = eq("hostName", "app.vodnavi.jp");
const CLICK1 = eq("eventName", "product_click");
const CLICK2 = and(eq("eventName", "click"), inList("linkDomain", ["al.dmm.co.jp", "al.fanza.co.jp"]));
const out = { fetched_at: new Date().toISOString(), property: PROPERTY, timezone: "Asia/Tokyo", range: R };
out.a_sessions_date_country = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "countryId" }], metrics: [{ name: "sessions" }, { name: "screenPageViews" }], dimensionFilter: HOST, limit: 1000 });
out.b1_product_click_date_country = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "countryId" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, CLICK1), limit: 1000 });
out.b2_outbound_click_date_country = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "countryId" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, CLICK2), limit: 1000 });
out.c_cn_landing_top = await run({ dateRanges: [R], dimensions: [{ name: "landingPage" }], metrics: [{ name: "sessions" }], dimensionFilter: and(HOST, eq("countryId", "CN")), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
out.c2_cn_pageviews_date_section = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "pagePath" }], metrics: [{ name: "screenPageViews" }], dimensionFilter: and(HOST, eq("countryId", "CN")), limit: 10000 });
out.d1_cn_browser_top = await run({ dateRanges: [R], dimensions: [{ name: "browser" }, { name: "browserVersion" }], metrics: [{ name: "sessions" }], dimensionFilter: and(HOST, eq("countryId", "CN")), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 5 });
out.d2_cn_source_top = await run({ dateRanges: [R], dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: [{ name: "sessions" }], dimensionFilter: and(HOST, eq("countryId", "CN")), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 5 });
out.e1_jp_product_click_date_page = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "pagePath" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, eq("countryId", "JP"), CLICK1), limit: 1000 });
out.e2_jp_outbound_date_page = await run({ dateRanges: [R], dimensions: [{ name: "date" }, { name: "pagePath" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, eq("countryId", "JP"), CLICK2), limit: 1000 });
out.f_cn_clicks_page = await run({ dateRanges: [R], dimensions: [{ name: "pagePath" }, { name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, eq("countryId", "CN"), { orGroup: { expressions: [CLICK1, CLICK2] } }), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 20 });
writeFileSync("ga4-cn-works.json", JSON.stringify(out, null, 1));
console.log("ok", out.fetched_at);
