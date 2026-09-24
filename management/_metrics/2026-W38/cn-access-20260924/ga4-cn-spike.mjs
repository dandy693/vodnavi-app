import fs from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(fs.readFileSync("app-concierge/ga4-service-account.json", "utf8"));
const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const h = b({ alg: "RS256", typ: "JWT" }), c = b({ iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
const s = createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${h}.${c}.${s.sign(KEY.private_key, "base64url")}` }) })).json()).access_token;
const run = async (body) => { const j = await (await fetch("https://analyticsdata.googleapis.com/v1beta/properties/489519780:runReport", { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) })).json(); if (j.error) throw new Error(JSON.stringify(j.error)); return (j.rows ?? []).map((r) => [...(r.dimensionValues ?? []).map((x) => x.value), ...r.metricValues.map((x) => x.value)]); };
const P = [{ startDate: "2026-09-21", endDate: "today" }];
const M = [{ name: "sessions" }, { name: "screenPageViews" }, { name: "engagementRate" }, { name: "averageSessionDuration" }];
const ctry = (cc) => ({ filter: { fieldName: "countryId", stringFilter: { matchType: "EXACT", value: cc } } });
const out = { fetched_at: new Date().toISOString(), period: "2026-09-21〜today" };
for (const cc of ["CN", "JP"]) {
  out[cc + "_total"] = await run({ dateRanges: P, metrics: M, dimensionFilter: ctry(cc) });
  out[cc + "_landing"] = await run({ dateRanges: P, dimensions: [{ name: "landingPage" }], metrics: M, dimensionFilter: ctry(cc), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 6 });
}
out.CN_source = await run({ dateRanges: P, dimensions: [{ name: "sessionSource" }], metrics: M, dimensionFilter: ctry("CN"), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 5 });
out.CN_newret = await run({ dateRanges: P, dimensions: [{ name: "newVsReturning" }], metrics: M, dimensionFilter: ctry("CN"), limit: 5 });
out.CN_events = await run({ dateRanges: P, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: ctry("CN"), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 12 });
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
for (const k of Object.keys(out)) if (Array.isArray(out[k])) { console.log("## " + k); out[k].forEach((r) => console.log(r.map((v) => /^\d+\.\d{4,}$/.test(v) ? Number(v).toFixed(3) : v).join(" | "))); }
