/**
 * brand_pilot_001 経由流入の実績（W裁定 材料①）
 * 【厳守】読み取り専用。鍵の値は出力しない。
 */
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json", "utf8"));
const P = "489519780", START = "2026-06-12", END = "2026-09-09"; // 直近90日

const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const h = b64u({ alg: "RS256", typ: "JWT" });
const c = b64u({ iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
const sg = createSign("RSA-SHA256"); sg.update(`${h}.${c}`); sg.end();
const tr = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${h}.${c}.${sg.sign(KEY.private_key, "base64url")}` }) });
const tok = (await tr.json()).access_token;
const run = async (b) => (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${P}:runReport`, { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(b) })).json();
const show = (j, cols) => {
  if (j.error) { console.log("  エラー:", JSON.stringify(j.error).slice(0, 200)); return 0; }
  if (!j.rows?.length) { console.log("  **0件**"); return 0; }
  console.log("| " + cols.join(" | ") + " |");
  console.log("|" + cols.map(() => "---").join("|") + "|");
  for (const r of j.rows) console.log("| " + [...r.dimensionValues.map(d => `\`${d.value}\``), ...r.metricValues.map(m => Number(m.value).toLocaleString())].join(" | ") + " |");
  return j.rows.length;
};
console.log(`=== brand_pilot_001 経由流入 / ${START}〜${END}（90日）===\n`);

console.log("## 1) カスタムディメンション `source` 別（イベント範囲）");
show(await run({ dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: "customEvent:source" }], metrics: [{ name: "eventCount" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 25 }), ["source", "イベント数", "セッション"]);

console.log("\n## 2) pageLocation に `brand_pilot` を含むページ");
show(await run({ dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: "pageLocation" }], metrics: [{ name: "screenPageViews" }, { name: "sessions" }], dimensionFilter: { filter: { fieldName: "pageLocation", stringFilter: { matchType: "CONTAINS", value: "brand_pilot", caseSensitive: false } } }, limit: 25 }), ["pageLocation", "PV", "セッション"]);

console.log("\n## 3) pageLocation に `source=` を含むページ（全 source を横断・上位20）");
show(await run({ dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: "pageLocation" }], metrics: [{ name: "screenPageViews" }], dimensionFilter: { filter: { fieldName: "pageLocation", stringFilter: { matchType: "CONTAINS", value: "source=", caseSensitive: false } } }, orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 20 }), ["pageLocation", "PV"]);

console.log("\n## 4) www からの参照（sessionSource / sessionMedium）");
show(await run({ dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: [{ name: "sessions" }, { name: "activeUsers" }], dimensionFilter: { orGroup: { expressions: [{ filter: { fieldName: "sessionSource", stringFilter: { matchType: "CONTAINS", value: "vodnavi" } } }, { filter: { fieldName: "sessionSource", stringFilter: { matchType: "CONTAINS", value: "moterist" } } }] } }, orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 20 }), ["source", "medium", "セッション", "ユーザー"]);

console.log("\n## 5) CTA 系イベントの総数（対照・同期間）");
show(await run({ dateRanges: [{ startDate: START, endDate: END }], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["concierge_entry_click", "product_click", "ai_affiliate_click", "ai_session_start", "early_cookie_burn"] } } }, orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 10 }), ["イベント名", "件数"]);
