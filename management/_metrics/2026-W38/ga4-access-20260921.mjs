/**
 * GA4 Data API — アクセス解析レポート（CSO 指示 2026-09-21・read-only・数字のみ）
 * 期間 A＝2026-08-23〜09-21（直近30日）／B＝2026-07-24〜08-22（その前30日）
 *
 * 【裁定4 準拠】management/ 配下（git 管理）に置く。
 * 【厳守】読み取り専用。鍵は §3 のとおり CTO ローカルバッチ専用で Vercel env へは投入しない。鍵の値は出力しない。
 * 出力: 標準出力に Markdown（access-20260921.md へ転記）
 */
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json", "utf8"));
const PROPERTY = "489519780"; // vodnavi.jp（app + www + apex + moterist 横断・§3）
const A = { startDate: "2026-08-23", endDate: "2026-09-21", name: "A" };
const B = { startDate: "2026-07-24", endDate: "2026-08-22", name: "B" };
const X_SOURCES = ["x.com", "t.co", "twitter.com", "x", "x_vodnavi", "X", "mobile.twitter.com", "x.com / social"];
const APP = "app.vodnavi.jp";

const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const h = b64u({ alg: "RS256", typ: "JWT" });
  const c = b64u({ iss: KEY.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now });
  const s = createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
  const jwt = `${h}.${c}.${s.sign(KEY.private_key, "base64url")}`;
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) });
  const j = await r.json();
  if (!j.access_token) throw new Error("token 取得失敗: " + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}
const tok = await token();
let calls = 0;
// 【CSO裁定 2026-09-25】中国発（JS 実行型ボット群）を既定で除外する（GA4 プロパティ側は不変）。含めるときは --include-cn。
// 2026-09-21 に出力した access-20260921.md の数字は本改修の前＝CN を含む（再集計はしない）。
const INCLUDE_CN = process.argv.includes("--include-cn");
const NOT_CN = { notExpression: { filter: { fieldName: "countryId", inListFilter: { values: ["CN"] } } } };
const run = async (body0) => {
  calls++;
  const f0 = body0.dimensionFilter;
  const body = INCLUDE_CN ? body0 : { ...body0, dimensionFilter: !f0 ? NOT_CN : f0.andGroup ? { andGroup: { expressions: [...f0.andGroup.expressions, NOT_CN] } } : { andGroup: { expressions: [f0, NOT_CN] } } };
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, { method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (j.error) throw new Error("GA4 error: " + JSON.stringify(j.error).slice(0, 400));
  return j;
};
const n = (v) => Number(v ?? 0);
const fmt = (v) => n(v).toLocaleString("en-US");
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + "%" : "—");
const rows = (j) => (j.rows ?? []).map((r) => ({ d: (r.dimensionValues ?? []).map((x) => x.value), m: (r.metricValues ?? []).map((x) => n(x.value)) }));
const out = [];
const P = (s = "") => out.push(s);

const hostFilter = { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: APP } } };
const xFilter = { filter: { fieldName: "sessionSource", inListFilter: { values: X_SOURCES, caseSensitive: false } } };
const and = (...exprs) => ({ andGroup: { expressions: exprs } });
const begins = (field, value) => ({ filter: { fieldName: field, stringFilter: { matchType: "BEGINS_WITH", value } } });
const eq = (field, value) => ({ filter: { fieldName: field, stringFilter: { matchType: "EXACT", value } } });
const inList = (field, values) => ({ filter: { fieldName: field, inListFilter: { values } } });

// ---------- 0. 鮮度 ----------
{
  const j = await run({ dateRanges: [{ startDate: "2026-09-10", endDate: "2026-09-21" }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" }, desc: true }], limit: 4 });
  P("### 0. 取得条件・鮮度");
  P(`- 取得: GA4 Data API v1beta \`runReport\`（プロパティ \`${PROPERTY}\`・サービスアカウント閲覧者・§3）。取得日時は本文冒頭。${INCLUDE_CN ? "**CN を含む（--include-cn）**" : "**country ≠ CN（CSO裁定 2026-09-25 の既定）**"}`);
  P(`- 処理済み最終日（\`date\` 次元で行が返る最新日・§6-1）: ${rows(j).map((r) => `${r.d[0]}（sessions ${fmt(r.m[0])}）`).join(" / ")}`);
  P(`- 期間 A＝${A.startDate}〜${A.endDate}（30 日）／B＝${B.startDate}〜${B.endDate}（30 日）。A の末日 9/21 は当日＝処理未了の可能性（§6-1）。`);
  P(`- ボット除外: GA4 は既知のボット・スパイダー（IAB リスト）のトラフィックを自動で除外する（プロパティ設定で無効化できない GA4 仕様）。当サイト側に追加のボットフィルタ・IP フィルタ・内部トラフィック除外の設定は無い（§6: 検証用 Chrome は \`/g/collect\` を送らないため CTO 操作分は計上されない）。`);
  P(`- プロパティは app.vodnavi.jp / www.vodnavi.jp / vodnavi.jp（apex）/ moterist.com を横断する（§3・§25-8）。「全体」は__プロパティ合計__と__hostName=app.vodnavi.jp__を並記。X 経由・works 面は hostName=app.vodnavi.jp に限定。`);
  P();
}

// ---------- 1. 全体 ----------
{
  P("### 1. 全体");
  P("#### 1-1. セッション／ユーザー／PV（A・B）");
  P("| 対象 | 期間 | セッション | アクティブユーザー | PV（screenPageViews） |");
  P("|---|---|---|---|---|");
  for (const per of [A, B]) {
    const j = await run({ dateRanges: [per], metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }] });
    const r = rows(j)[0]?.m ?? [0, 0, 0];
    P(`| プロパティ合計 | ${per.name} | ${fmt(r[0])} | ${fmt(r[1])} | ${fmt(r[2])} |`);
  }
  for (const per of [A, B]) {
    const j = await run({ dateRanges: [per], dimensions: [{ name: "hostName" }], metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 });
    for (const r of rows(j)) P(`| \`${r.d[0]}\` | ${per.name} | ${fmt(r.m[0])} | ${fmt(r.m[1])} | ${fmt(r.m[2])} |`);
  }
  P();
  P("#### 1-2. チャネル別セッション（`sessionDefaultChannelGroup`）");
  for (const scope of ["プロパティ合計", APP]) {
    P(`**${scope}**`);
    P();
    P("| チャネル | A | B |");
    P("|---|---|---|");
    const acc = {};
    for (const per of [A, B]) {
      const body = { dateRanges: [per], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 30 };
      if (scope === APP) body.dimensionFilter = hostFilter;
      for (const r of rows(await run(body))) (acc[r.d[0]] ??= { A: 0, B: 0 })[per.name] = r.m[0];
    }
    const order = ["Organic Search", "Organic Social", "Direct", "Referral", "Unassigned"];
    const keys = [...order.filter((k) => acc[k]), ...Object.keys(acc).filter((k) => !order.includes(k)).sort((a, b) => acc[b].A - acc[a].A)];
    for (const k of keys) P(`| ${k} | ${fmt(acc[k].A)} | ${fmt(acc[k].B)} |`);
    P(`| **合計** | **${fmt(Object.values(acc).reduce((s, v) => s + v.A, 0))}** | **${fmt(Object.values(acc).reduce((s, v) => s + v.B, 0))}** |`);
    P();
  }
  P("#### 1-3. Social の内訳（`sessionSource` / `sessionMedium`・hostName=app.vodnavi.jp・チャネル Organic Social + Social 系 source）");
  P("| sessionSource | sessionMedium | A | B |");
  P("|---|---|---|---|");
  const acc = {};
  for (const per of [A, B]) {
    const body = { dateRanges: [per], dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: [{ name: "sessions" }], dimensionFilter: and(hostFilter, { orGroup: { expressions: [eq("sessionDefaultChannelGroup", "Organic Social"), eq("sessionDefaultChannelGroup", "Paid Social"), xFilter] } }), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 30 };
    for (const r of rows(await run(body))) (acc[`${r.d[0]}｜${r.d[1]}`] ??= { A: 0, B: 0 })[per.name] = r.m[0];
  }
  for (const k of Object.keys(acc).sort((a, b) => (acc[b].A + acc[b].B) - (acc[a].A + acc[a].B))) P(`| \`${k.split("｜")[0]}\` | \`${k.split("｜")[1]}\` | ${fmt(acc[k].A)} | ${fmt(acc[k].B)} |`);
  if (!Object.keys(acc).length) P("| （行なし） | | 0 | 0 |");
  P();
}

// ---------- 2. X 経由 ----------
{
  P("### 2. X 経由（`sessionSource` ∈ {x.com, t.co, twitter.com, x, x_vodnavi, mobile.twitter.com}・大文字小文字無視・hostName=app.vodnavi.jp）");
  P("- 定義: `utm_source=x`／`x_vodnavi` は sessionSource にそのまま入る。referrer が t.co の場合 GA4 は sessionSource=`t.co` または `x.com` として記録する。上の集合に無い表記があれば 1-3 の表に現れる。");
  P();
  P("#### 2-1. 日別セッション（2026-09-01〜09-21）");
  P("| 日 | X 経由セッション | 同・アクティブユーザー | 同・PV | （参考）app 全体セッション |");
  P("|---|---|---|---|---|");
  const jx = await run({ dateRanges: [{ startDate: "2026-09-01", endDate: "2026-09-21" }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }], dimensionFilter: and(hostFilter, xFilter), orderBys: [{ dimension: { dimensionName: "date" } }], limit: 40 });
  const jall = await run({ dateRanges: [{ startDate: "2026-09-01", endDate: "2026-09-21" }], dimensions: [{ name: "date" }], metrics: [{ name: "sessions" }], dimensionFilter: hostFilter, orderBys: [{ dimension: { dimensionName: "date" } }], limit: 40 });
  const xm = Object.fromEntries(rows(jx).map((r) => [r.d[0], r.m]));
  const am = Object.fromEntries(rows(jall).map((r) => [r.d[0], r.m[0]]));
  let tx = [0, 0, 0], ta = 0;
  for (let d = 1; d <= 21; d++) {
    const key = `202609${String(d).padStart(2, "0")}`;
    const v = xm[key] ?? [0, 0, 0];
    tx = tx.map((s, i) => s + v[i]); ta += am[key] ?? 0;
    P(`| 9/${d} | ${fmt(v[0])} | ${fmt(v[1])} | ${fmt(v[2])} | ${fmt(am[key] ?? 0)} |`);
  }
  P(`| **合計** | **${fmt(tx[0])}** | **${fmt(tx[1])}** | **${fmt(tx[2])}** | **${fmt(ta)}** |`);
  P();
  P("#### 2-2. 着地ページ上位 10（`landingPage`・期間 A・X 経由）");
  const jl = await run({ dateRanges: [A], dimensions: [{ name: "landingPage" }], metrics: [{ name: "sessions" }], dimensionFilter: and(hostFilter, xFilter), orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 200 });
  const lr = rows(jl);
  const ltotal = lr.reduce((s, r) => s + r.m[0], 0);
  const lworks = lr.filter((r) => r.d[0].startsWith("/works/")).reduce((s, r) => s + r.m[0], 0);
  P("| # | landingPage | セッション |");
  P("|---|---|---|");
  lr.slice(0, 10).forEach((r, i) => P(`| ${i + 1} | \`${r.d[0]}\` | ${fmt(r.m[0])} |`));
  P(`| | **合計（全 ${lr.length} ページ）** | **${fmt(ltotal)}** |`);
  P(`| | **うち \`/works/*\`** | **${fmt(lworks)}（${pct(lworks, ltotal)}）** |`);
  P();
  P("#### 2-3. 年齢確認（`age_gate_view` → `age_gate_agree`・`age_gate_bounce`・期間 A）");
  P("- イベントは `age-gate-modal.tsx`（`gate=age_gate_page`）と `age-gate-overlay.tsx`（`gate=site_overlay`）が発火。通過率＝agree ÷ view（イベント数）。");
  P("| 対象 | gate | age_gate_view | age_gate_agree | age_gate_bounce | agree÷view |");
  P("|---|---|---|---|---|---|");
  for (const [label, filt] of [["X 経由", and(hostFilter, xFilter)], ["app 全体", hostFilter]]) {
    const j = await run({ dateRanges: [A], dimensions: [{ name: "eventName" }, { name: "customEvent:gate" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(filt, inList("eventName", ["age_gate_view", "age_gate_agree", "age_gate_bounce"])), limit: 50 });
    const acc = {};
    for (const r of rows(j)) (acc[r.d[1]] ??= {})[r.d[0]] = r.m[0];
    const gates = Object.keys(acc);
    if (!gates.length) P(`| ${label} | （行なし） | 0 | 0 | 0 | — |`);
    let tv = 0, tg = 0, tb = 0;
    for (const g of gates) {
      const v = acc[g].age_gate_view ?? 0, ag = acc[g].age_gate_agree ?? 0, b = acc[g].age_gate_bounce ?? 0;
      tv += v; tg += ag; tb += b;
      P(`| ${label} | \`${g}\` | ${fmt(v)} | ${fmt(ag)} | ${fmt(b)} | ${pct(ag, v)} |`);
    }
    if (gates.length > 1) P(`| ${label} | **計** | ${fmt(tv)} | ${fmt(tg)} | ${fmt(tb)} | ${pct(tg, tv)} |`);
  }
  P();
  P("#### 2-4. 外部クリック（期間 A・X 経由）");
  P("- ① 明示計装 `product_click`（`placement` 付き・`ai_affiliate_click` と双発）／② GA4 拡張計測 `click`（outbound・`linkDomain`）の 2 系統（§14-13-8-1）。合算しない。");
  P("| 系統 | イベント | linkDomain / placement | クリック元ページ（pagePath） | 件数 |");
  P("|---|---|---|---|---|");
  {
    const j = await run({ dateRanges: [A], dimensions: [{ name: "pagePath" }, { name: "customEvent:placement" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(hostFilter, xFilter, eq("eventName", "product_click")), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 50 });
    const rr = rows(j);
    if (!rr.length) P("| ① | `product_click` | — | （行なし） | 0 |");
    let t = 0; for (const r of rr) { t += r.m[0]; P(`| ① | \`product_click\` | \`${r.d[1]}\` | \`${r.d[0]}\` | ${fmt(r.m[0])} |`); }
    if (rr.length) P(`| ① | **計** | | | **${fmt(t)}** |`);
  }
  {
    const j = await run({ dateRanges: [A], dimensions: [{ name: "pagePath" }, { name: "linkDomain" }], metrics: [{ name: "eventCount" }], dimensionFilter: and(hostFilter, xFilter, eq("eventName", "click"), inList("linkDomain", ["al.dmm.co.jp", "al.fanza.co.jp"])), orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 50 });
    const rr = rows(j);
    if (!rr.length) P("| ② | `click`（outbound） | al.dmm.co.jp / al.fanza.co.jp | （行なし） | 0 |");
    let t = 0; for (const r of rr) { t += r.m[0]; P(`| ② | \`click\` | \`${r.d[1]}\` | \`${r.d[0]}\` | ${fmt(r.m[0])} |`); }
    if (rr.length) P(`| ② | **計** | | | **${fmt(t)}** |`);
  }
  P();
  P("（参考・app 全体の同指標・期間 A）");
  P("| 系統 | 件数 A | 件数 B |");
  P("|---|---|---|");
  for (const [label, filt] of [["① `product_click`", eq("eventName", "product_click")], ["② `click` outbound → al.dmm.co.jp / al.fanza.co.jp", and(eq("eventName", "click"), inList("linkDomain", ["al.dmm.co.jp", "al.fanza.co.jp"]))]]) {
    const v = [];
    for (const per of [A, B]) { const j = await run({ dateRanges: [per], metrics: [{ name: "eventCount" }], dimensionFilter: and(hostFilter, filt) }); v.push(rows(j)[0]?.m[0] ?? 0); }
    P(`| ${label} | ${fmt(v[0])} | ${fmt(v[1])} |`);
  }
  P();
}

// ---------- 3. works 面 ----------
{
  P("### 3. works 面（hostName=app.vodnavi.jp・PV＝`screenPageViews`）");
  P("#### 3-1. PV 上位 20 ページ（`pagePath` が `/works/` で始まる・A と B を別々に）");
  const floorOf = (p) => (p.match(/^\/works\/([^/]+)\//)?.[1] ?? "(other)");
  for (const per of [A, B]) {
    const j = await run({ dateRanges: [per], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "sessions" }], dimensionFilter: and(hostFilter, begins("pagePath", "/works/")), orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 20 });
    P(`**期間 ${per.name}（${per.startDate}〜${per.endDate}）**`);
    P();
    P("| # | pagePath | フロア | PV | セッション |");
    P("|---|---|---|---|---|");
    rows(j).forEach((r, i) => P(`| ${i + 1} | \`${r.d[0]}\` | ${floorOf(r.d[0])} | ${fmt(r.m[0])} | ${fmt(r.m[1])} |`));
    P();
  }
  P("#### 3-2. フロア別 PV（`/works/<floor>/`・A・B）");
  P("| フロア | PV A | PV B | ページ数 A | ページ数 B |");
  P("|---|---|---|---|---|");
  const fl = {};
  for (const per of [A, B]) {
    const j = await run({ dateRanges: [per], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], dimensionFilter: and(hostFilter, begins("pagePath", "/works/")), limit: 100000 });
    for (const r of rows(j)) { const f = floorOf(r.d[0]); const o = (fl[f] ??= { A: 0, B: 0, nA: 0, nB: 0 }); o[per.name] += r.m[0]; o["n" + per.name] += 1; }
  }
  for (const f of Object.keys(fl).sort((a, b) => fl[b].A - fl[a].A)) P(`| \`${f}\` | ${fmt(fl[f].A)} | ${fmt(fl[f].B)} | ${fmt(fl[f].nA)} | ${fmt(fl[f].nB)} |`);
  P();
  P("#### 3-3. 面別 PV（A・B）");
  P("| 面（pagePath の接頭） | PV A | PV B | セッション A | セッション B |");
  P("|---|---|---|---|---|");
  for (const pre of ["/works/", "/articles/", "/actresses/", "/genres/", "/sale", "/concierge", "/lp", "/"]) {
    const v = [];
    for (const per of [A, B]) {
      const body = { dateRanges: [per], metrics: [{ name: "screenPageViews" }, { name: "sessions" }], dimensionFilter: and(hostFilter, pre === "/" ? eq("pagePath", "/") : begins("pagePath", pre)) };
      const j = await run(body); v.push(rows(j)[0]?.m ?? [0, 0]);
    }
    P(`| \`${pre}${pre === "/" ? "（トップ完全一致）" : "*"}\` | ${fmt(v[0][0])} | ${fmt(v[1][0])} | ${fmt(v[0][1])} | ${fmt(v[1][1])} |`);
  }
  {
    const v = [];
    for (const per of [A, B]) { const j = await run({ dateRanges: [per], metrics: [{ name: "screenPageViews" }, { name: "sessions" }], dimensionFilter: hostFilter }); v.push(rows(j)[0]?.m ?? [0, 0]); }
    P(`| **app.vodnavi.jp 全体** | **${fmt(v[0][0])}** | **${fmt(v[1][0])}** | **${fmt(v[0][1])}** | **${fmt(v[1][1])}** |`);
  }
  P();
}

P(`（GA4 Data API 呼び出し ${calls} 回）`);
process.stdout.write(out.join("\n") + "\n");
