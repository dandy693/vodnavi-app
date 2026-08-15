/**
 * GA4 Data API 取得スクリプト【実装準備版・rev1】
 *
 *   CSO裁定 2026-08-16（第61便 補遺2）で GA4 Data API の採用が確定。
 *   本ファイルは **資格情報の到着前に用意した準備版**であり、まだ実行していない。
 *
 * 【厳守・鍵の取り扱い】
 *   - 本スクリプトは鍵ファイルを **読み込むが、内容を一切出力しない**。
 *   - エラー時も `private_key` / `client_email` を含む値を print しない
 *     （例外メッセージに鍵が混ざらないよう、catch で握り直す）。
 *   - 鍵の中身を人・ログ・標準出力へ出す処理を **追加しないこと**。
 *
 * 【配置】現在 `management/_metrics/2026-W33/ga4-prepared/` にある。
 *   実行時に `app-concierge/scripts/ga4-pull.mjs` へ移すこと。
 *   いま `app-concierge/` 配下に置かないのは、`ignoreCommand` が production
 *   ビルドを起こすためで、`null` ガードの効果測定窓
 *   （2026-08-15 23:31 〜 2026-08-16 23:31）にデプロイを挟まない。
 *
 * 依存ゼロ（`node:crypto` のみ）。`GA4_DATA_API_SETUP.md` §5 の方針どおり。
 *
 * 実行:
 *   node --env-file=.env.local scripts/ga4-pull.mjs
 *   （鍵の既定パス = `app-concierge/ga4-service-account.json`。
 *     `GA4_KEY_PATH` で上書き可）
 */

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const PROPERTY_ID = "489519780"; // FACT_GOVERNANCE §3 で確定した vodnavi.jp のプロパティ
const KEY_PATH = process.env.GA4_KEY_PATH ?? "./ga4-service-account.json";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const API = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;

/** 期間。GA4 の実測系列と揃える（FACT_GOVERNANCE §14 の 90日窓と同起点）。 */
const START_DATE = process.env.GA4_START ?? "2026-05-13";
const END_DATE = process.env.GA4_END ?? "today";

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/**
 * サービスアカウント鍵で JWT を作り、アクセストークンへ交換する。
 * 【厳守】鍵の内容はこの関数の外へ出さない。例外も握り直す。
 */
async function getAccessToken() {
  let clientEmail, privateKey;
  try {
    const raw = JSON.parse(readFileSync(KEY_PATH, "utf8"));
    clientEmail = raw.client_email;
    privateKey = raw.private_key;
    if (!clientEmail || !privateKey) throw new Error("missing fields");
  } catch {
    // 【厳守】元の例外を再送出しない（鍵の断片が混ざる可能性を断つ）
    throw new Error(
      `鍵ファイルを読めない、または形式が不正: ${KEY_PATH}（内容は出力しない）`,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URI,
      exp: now + 3600,
      iat: now,
    }),
  );
  let signature;
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${claim}`);
    signature = b64url(signer.sign(privateKey));
  } catch {
    throw new Error("JWT の署名に失敗した（鍵の形式を確認すること・内容は出力しない）");
  }

  const res = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  if (!res.ok) {
    // レスポンス本文にはトークンも鍵も含まれない（エラー種別のみ）
    throw new Error(`トークン交換に失敗: HTTP ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function runReport(token, body, label) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const quota = {
    tokensPerDay: res.headers.get("x-goog-quota-tokens-per-day-remaining"),
    tokensPerHour: res.headers.get("x-goog-quota-tokens-per-hour-remaining"),
  };
  if (!res.ok) {
    console.error(`[${label}] 失敗: HTTP ${res.status} ${await res.text()}`);
    return { rows: [], quota, ok: false };
  }
  const json = await res.json();
  return { json, quota, ok: true };
}

const dateRange = [{ startDate: START_DATE, endDate: END_DATE }];
const eventFilter = (name) => ({
  filter: { fieldName: "eventName", stringFilter: { value: name } },
});

async function main() {
  const token = await getAccessToken();
  console.log(`# GA4 Data API 取得（${START_DATE} 〜 ${END_DATE}）\n`);

  // (1) 日別 product_click
  const daily = await runReport(
    token,
    {
      dateRanges: dateRange,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter("product_click"),
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 400,
    },
    "日別 product_click",
  );

  // (2) placement 別の内訳（product_click）
  const byPlacement = await runReport(
    token,
    {
      dateRanges: dateRange,
      dimensions: [{ name: "customEvent:placement" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter("product_click"),
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 100,
    },
    "placement 別 product_click",
  );

  // (3) 補助指標 ①-a: works→articles 内部リンククリック
  //     計装は `article-guide-links.tsx`（イベント `article_guide_click`・
  //     placement = works_to_articles_cta / actresses_to_articles_cta）
  const guideClick = await runReport(
    token,
    {
      dateRanges: dateRange,
      dimensions: [{ name: "customEvent:placement" }, { name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: eventFilter("article_guide_click"),
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 1000,
    },
    "article_guide_click（補助指標 ①-a）",
  );

  const dump = (label, r) => {
    console.log(`\n## ${label}`);
    if (!r.ok) {
      console.log("**取得できなかった**（上記の stderr を参照）");
      return;
    }
    const dims = (r.json.dimensionHeaders ?? []).map((d) => d.name);
    const mets = (r.json.metricHeaders ?? []).map((m) => m.name);
    console.log(`\n| ${[...dims, ...mets].join(" | ")} |`);
    console.log(`|${[...dims, ...mets].map(() => "---").join("|")}|`);
    for (const row of r.json.rows ?? []) {
      const d = (row.dimensionValues ?? []).map((v) => v.value);
      const m = (row.metricValues ?? []).map((v) => v.value);
      console.log(`| ${[...d, ...m].join(" | ")} |`);
    }
    console.log(`\n行数: ${(r.json.rows ?? []).length} / rowCount: ${r.json.rowCount ?? "-"}`);
    if (r.json.rows === undefined) console.log("**rows が無い＝0件**");
  };

  dump("(1) 日別 product_click", daily);
  dump("(2) placement 別 product_click", byPlacement);
  dump("(3) article_guide_click（補助指標 ①-a）", guideClick);

  // §10 の適用: 合計と内訳が一致することを検算する
  const sum = (r) =>
    (r.json?.rows ?? []).reduce((a, row) => a + Number(row.metricValues[0].value), 0);
  console.log(`\n## 検算（§10）`);
  console.log(`- 日別の合計: ${sum(daily)}`);
  console.log(`- placement 別の合計: ${sum(byPlacement)}`);
  console.log(
    sum(daily) === sum(byPlacement)
      ? "- **一致した**"
      : `- **一致しない**（差 ${sum(daily) - sum(byPlacement)}）。**「一致しない」と記録すること**`,
  );

  // 割当の実測（GA4_DATA_API_SETUP.md §4 の「初回実行で記録する」）
  console.log(`\n## 割当の実測`);
  console.log(`- 1日あたり残り: ${daily.quota.tokensPerDay ?? "ヘッダなし"}`);
  console.log(`- 1時間あたり残り: ${daily.quota.tokensPerHour ?? "ヘッダなし"}`);
}

main().catch((e) => {
  // 【厳守】例外メッセージに鍵が混ざらないよう、message のみを出す
  console.error("[ga4-pull] 失敗:", e.message);
  process.exit(1);
});
