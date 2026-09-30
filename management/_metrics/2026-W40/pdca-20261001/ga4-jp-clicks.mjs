/**
 * GA4 Data API — Alibaba Challenge（E28-3）事前登録テスト用 JP 外部クリック日別（木曜PDCA 2026-10-01・read-only）
 * 期間 2026-09-23〜10-01（窓 9/30〜10/6 の途中まで）・日別・プロパティ 489519780（タイムゾーン Asia/Tokyo＝§3）
 * 外部クリックの定義は ga4-access-20260921.mjs と同一:
 *   ① product_click（明示計装・placement 付き）
 *   ② click（拡張計測 outbound）かつ linkDomain ∈ {al.dmm.co.jp, al.fanza.co.jp}
 * CN を除外しない（本調査の対象のため）。hostName=app.vodnavi.jp。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json", "utf8"));
const PROPERTY = "489519780";
const R = { startDate: "2026-09-23", endDate: "2026-10-01" };
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
const JP = eq("countryId", "JP");
out.jp_product_click_by_date = await run({ dateRanges: [R], dimensions: [{ name: "date" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, CLICK1, JP), limit: 100 });
out.jp_outbound_click_by_date = await run({ dateRanges: [R], dimensions: [{ name: "date" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(HOST, CLICK2, JP), limit: 100 });
writeFileSync(new URL("./ga4-jp-clicks.json", import.meta.url), JSON.stringify(out, null, 1));
const m = (a) => Object.fromEntries(a.map((r) => [r[0], r[1]]));
const p = m(out.jp_product_click_by_date), o = m(out.jp_outbound_click_by_date);
for (let d = new Date("2026-09-23"); d <= new Date("2026-10-01"); d.setUTCDate(d.getUTCDate() + 1)) { const k = d.toISOString().slice(0, 10).replace(/-/g, ""); console.log(k, "product_click", p[k] ?? 0, "outbound(al.*)", o[k] ?? 0); }
