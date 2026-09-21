// 引用ポスト（基盤D・CSO 指示 2026-09-21 夜）の計測 — GA4 Data API で utm_medium=quote のセッションを集計する（read-only・数字のみ）
// 木曜集計（weekly-report.mjs --ga4-quote）に添付する。鍵は §3 のとおり CTO ローカルバッチ専用（値は出力しない）。
//
//   node management/tools/x-reply-drafts/ga4-quote-sessions.mjs --since 2026-09-22 --until 2026-09-24 [--out ga4_quote.json] [--key app-concierge/ga4-service-account.json]
//
// 条件: hostName = app.vodnavi.jp ∧ sessionMedium = quote（URL の utm_medium=quote）。内訳は sessionManualAdContent（utm_content=<ハンドル>）と landingPage。
// 出力 { period, total: { sessions, users, pageviews }, by_content: [...], by_landing: [...], by_date: [...], note }

import fs from "node:fs";
import path from "node:path";
import { createSign } from "node:crypto";
import { fileURLToPath } from "node:url";
import { isMain } from "./parse.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
export const PROPERTY = "489519780";
export const APP = "app.vodnavi.jp";

const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");

async function token(key) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u({ alg: "RS256", typ: "JWT" });
  const c = b64u({ iss: key.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
  const s = createSign("RSA-SHA256");
  s.update(`${h}.${c}`);
  s.end();
  const jwt = `${h}.${c}.${s.sign(key.private_key, "base64url")}`;
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("token 取得失敗: " + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

const n = (v) => Number(v ?? 0);
const rows = (j) => (j.rows ?? []).map((r) => ({ d: (r.dimensionValues ?? []).map((x) => x.value), m: (r.metricValues ?? []).map((x) => n(x.value)) }));

export async function fetchQuoteSessions({ since, until, keyFile = path.join(REPO, "app-concierge", "ga4-service-account.json") }) {
  const key = JSON.parse(fs.readFileSync(keyFile, "utf8"));
  const tok = await token(key);
  const run = async (body) => {
    const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (j.error) throw new Error("GA4 error: " + JSON.stringify(j.error).slice(0, 400));
    return j;
  };
  const filter = { andGroup: { expressions: [
    { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: APP } } },
    { filter: { fieldName: "sessionMedium", stringFilter: { matchType: "EXACT", value: "quote" } } },
  ] } };
  const metrics = [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }];
  const period = { startDate: since, endDate: until };
  const total = rows(await run({ dateRanges: [period], metrics, dimensionFilter: filter }))[0]?.m ?? [0, 0, 0];
  const byContent = rows(await run({ dateRanges: [period], dimensions: [{ name: "sessionManualAdContent" }], metrics, dimensionFilter: filter, orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 50 }));
  const byLanding = rows(await run({ dateRanges: [period], dimensions: [{ name: "landingPage" }], metrics, dimensionFilter: filter, orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 50 }));
  const byDate = rows(await run({ dateRanges: [period], dimensions: [{ name: "date" }], metrics, dimensionFilter: filter, orderBys: [{ dimension: { dimensionName: "date" } }], limit: 100 }));
  const pack = (r, k) => ({ [k]: r.d[0], sessions: r.m[0], users: r.m[1], pageviews: r.m[2] });
  return {
    fetched_at: new Date().toISOString(),
    period,
    filter: `hostName=${APP} AND sessionMedium=quote`,
    total: { sessions: total[0], users: total[1], pageviews: total[2] },
    by_content: byContent.map((r) => pack(r, "content")),
    by_landing: byLanding.map((r) => pack(r, "landing")),
    by_date: byDate.map((r) => pack(r, "date")),
    note: "GA4 Data API（プロパティ 489519780・サービスアカウント閲覧者・§3）。当日・前日の行は処理遅延で未生成のことがある（§6-1）。X 側のインプレッション（引用ポストは自投稿として X Analytics CSV に含める）とは計測系が別。",
  };
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const nxt = argv[i + 1];
    if (nxt == null || nxt.startsWith("--")) a[k.slice(2)] = true;
    else a[k.slice(2)] = argv[++i];
  }
  return a;
}

if (isMain(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  if (!a.since || !a.until) {
    process.stderr.write("usage: node ga4-quote-sessions.mjs --since YYYY-MM-DD --until YYYY-MM-DD [--out ga4_quote.json] [--key path]\n");
    process.exit(2);
  }
  fetchQuoteSessions({ since: a.since, until: a.until, ...(a.key ? { keyFile: a.key } : {}) })
    .then((out) => {
      const text = JSON.stringify(out, null, 2) + "\n";
      if (a.out) {
        fs.writeFileSync(a.out, text);
        process.stderr.write(`[ga4-quote] wrote ${a.out}\n`);
      } else process.stdout.write(text);
    })
    .catch((e) => {
      process.stderr.write(`[ga4-quote] ERROR ${e.message}\n`);
      process.exitCode = 1;
    });
}
