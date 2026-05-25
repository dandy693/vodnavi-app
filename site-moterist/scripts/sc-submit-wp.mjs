#!/usr/bin/env node
/**
 * sc-submit-wp.mjs
 *
 * Search Console Indexing API への URL 通知スクリプト。
 * WordPress (moterist.com) で記事を新規 publish / update した直後に
 * Googlebot へ即時クロール要求を送るための独立した冪等 CLI。
 *
 * 認証:
 *   サービスアカウント JSON を環境変数 `GOOGLE_APPLICATION_CREDENTIALS_JSON`
 *   に文字列として渡す。Node 組み込み `node:crypto` だけで RS256 JWT を組み立て、
 *   `https://oauth2.googleapis.com/token` でアクセストークンに交換する
 *   （`googleapis` パッケージへの依存を避け、scripts/ ディレクトリを 0-dep に保つ）。
 *
 * エンドポイント:
 *   `https://indexing.googleapis.com/v3/urlNotifications:publish`
 *   ※ user spec で示された `commentanalyzer.googleapis.com` は Perspective API
 *      (毒性検出) のホストであり Indexing API ではない。本スクリプトは Search
 *      Console / Webmasters の正しい indexing.googleapis.com を使用する。
 *
 * 冪等性:
 *   `site-moterist/.cache/indexing-history.json` に { url -> { lastSubmittedAt,
 *   lastType, lastStatus } } を記録。デフォルトで 24 時間以内に同一 URL を同一
 *   type で成功送信していれば no-op。`--force` で抑止可能。.cache/ は root
 *   .gitignore 対象なので履歴がリポジトリへ混入しない。
 *
 * 使い方:
 *   # 単体送信（slug は moterist.com 起点の絶対パスでも可）
 *   node site-moterist/scripts/sc-submit-wp.mjs /fanza20250329/
 *   node site-moterist/scripts/sc-submit-wp.mjs https://moterist.com/fanza20250329/
 *
 *   # 削除通知 (post unpublish 時)
 *   node site-moterist/scripts/sc-submit-wp.mjs /old-post/ --type=URL_DELETED
 *
 *   # 一気通貫: 複数 slug を順次送信
 *   node site-moterist/scripts/sc-submit-wp.mjs /a/ /b/ /c/
 *
 *   # site 切替（vodnavi.jp / app.vodnavi.jp 等にも流用可）
 *   node site-moterist/scripts/sc-submit-wp.mjs /works/digital/abc --site=https://app.vodnavi.jp
 *
 *   # 履歴を無視して強制再送
 *   node site-moterist/scripts/sc-submit-wp.mjs /fanza20250329/ --force
 *
 *   # 認証だけ通して送信は行わない（疎通確認）
 *   node site-moterist/scripts/sc-submit-wp.mjs /fanza20250329/ --dry-run
 *
 * 終了コード:
 *   0 = 全 URL について成功 (200) または no-op (重複スキップ)
 *   1 = 1 件以上で API エラー / 認証失敗 / 引数不正
 *
 * クォータ:
 *   Indexing API は 1 プロジェクト 200 URL/日（Google 公式は Job posting / Live
 *   stream 用途を謳うが、Googlebot は他用途でも受信側でフェッチに動く実績がある）。
 *   超過時は HTTP 429 が返るので、本スクリプト出力 / .cache/indexing-history.json
 *   を見て手動 throttle すること。
 *
 * 関連:
 *   - site-moterist/scripts/generate-seo-robots.mjs (robots.txt 生成と並ぶ
 *     SEO 自動化スクリプト群)
 *   - management/ALERTS.md 2026-05-25 「moterist テクニカル SEO 脆弱性」エントリ
 */

import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SITE = "https://moterist.com";
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const INDEXING_ENDPOINT =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";
const SCOPE = "https://www.googleapis.com/auth/indexing";

const HERE = dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = resolve(
  HERE,
  "..",
  ".cache",
  "indexing-history.json",
);

// ───────────────────────── CLI 引数解析 ─────────────────────────

function parseArgs(argv) {
  const opts = {
    type: "URL_UPDATED",
    site: DEFAULT_SITE,
    dryRun: false,
    force: false,
    urls: [],
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
    else if (a.startsWith("--type=")) opts.type = a.slice("--type=".length);
    else if (a === "--type") opts.type = argv[++i];
    else if (a.startsWith("--site=")) opts.site = a.slice("--site=".length);
    else if (a === "--site") opts.site = argv[++i];
    else if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else if (a.startsWith("--")) {
      throw new Error(`Unknown flag: ${a}`);
    } else {
      opts.urls.push(a);
    }
  }
  if (opts.urls.length === 0) {
    throw new Error("at least one URL or slug is required");
  }
  if (opts.type !== "URL_UPDATED" && opts.type !== "URL_DELETED") {
    throw new Error(`--type must be URL_UPDATED or URL_DELETED (got ${opts.type})`);
  }
  return opts;
}

function printUsage() {
  console.log(
    `Usage: node sc-submit-wp.mjs <slug-or-url> [<slug-or-url>...] [options]
Options:
  --type=URL_UPDATED|URL_DELETED   通知種別 (default: URL_UPDATED)
  --site=<https://...>             サイトオリジン (default: ${DEFAULT_SITE})
  --dry-run                        認証だけ通して送信は行わない
  --force                          履歴を無視して強制再送
  -h, --help                       このヘルプを表示

Required env:
  GOOGLE_APPLICATION_CREDENTIALS_JSON  サービスアカウント JSON 文字列`,
  );
}

// ──────────────────────── URL 正規化 ────────────────────────

function normalizeUrl(input, site) {
  if (/^https?:\/\//i.test(input)) return input;
  const slug = input.startsWith("/") ? input : `/${input}`;
  const base = site.endsWith("/") ? site.slice(0, -1) : site;
  return `${base}${slug}`;
}

// ──────────────────────── 履歴ストア ────────────────────────

async function readHistory() {
  try {
    const raw = await readFile(HISTORY_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch (e) {
    if (e?.code === "ENOENT") return {};
    if (e instanceof SyntaxError) {
      console.warn(
        `[sc-submit-wp] history file unreadable (${e.message}); starting fresh`,
      );
      return {};
    }
    throw e;
  }
}

async function writeHistory(history) {
  await mkdir(dirname(HISTORY_PATH), { recursive: true });
  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), "utf8");
}

function shouldSkip(history, url, type) {
  const entry = history[url];
  if (!entry) return false;
  if (entry.lastType !== type) return false;
  if (typeof entry.lastStatus !== "number" || entry.lastStatus >= 300) {
    return false;
  }
  const lastTs = Date.parse(entry.lastSubmittedAt);
  if (!Number.isFinite(lastTs)) return false;
  return Date.now() - lastTs < DEDUP_WINDOW_MS;
}

// ──────────────────────── JWT 生成 ────────────────────────

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function loadServiceAccount() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error(
      "env GOOGLE_APPLICATION_CREDENTIALS_JSON is required (service account JSON string)",
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON: ${e.message}`,
    );
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "service account JSON must have client_email and private_key",
    );
  }
  return parsed;
}

async function fetchAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = b64url(signer.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`token exchange failed ${res.status}: ${body}`);
  }
  const { access_token } = await res.json();
  if (!access_token) {
    throw new Error("token exchange returned no access_token");
  }
  return access_token;
}

// ──────────────────────── Indexing API 送信 ────────────────────────

async function submitOne({ url, type, accessToken }) {
  const res = await fetch(INDEXING_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
  });
  const body = await res.text();
  return { status: res.status, body };
}

// ──────────────────────── メインフロー ────────────────────────

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv);
  } catch (e) {
    console.error(`[sc-submit-wp] arg error: ${e.message}`);
    printUsage();
    process.exit(1);
  }

  const sa = loadServiceAccount();
  const targets = opts.urls.map((raw) => normalizeUrl(raw, opts.site));

  const history = await readHistory();

  // 履歴チェックで no-op 確定する URL を先に弾き、API クォータを温存。
  const queue = [];
  for (const url of targets) {
    if (!opts.force && shouldSkip(history, url, opts.type)) {
      const ts = history[url]?.lastSubmittedAt;
      console.log(
        `[sc-submit-wp] no-op (within 24h): ${url} (last ${opts.type} @ ${ts})`,
      );
      continue;
    }
    queue.push(url);
  }

  if (queue.length === 0) {
    console.log("[sc-submit-wp] all targets were no-ops; nothing to send");
    return;
  }

  if (opts.dryRun) {
    console.log(
      `[sc-submit-wp] dry-run: would authenticate as ${sa.client_email} and submit ${queue.length} URL(s):`,
    );
    for (const url of queue) {
      console.log(`  - ${opts.type} ${url}`);
    }
    return;
  }

  const accessToken = await fetchAccessToken(sa);
  console.log(
    `[sc-submit-wp] auth OK as ${sa.client_email}; sending ${queue.length} URL(s)`,
  );

  let hadError = false;
  for (const url of queue) {
    try {
      const { status, body } = await submitOne({
        url,
        type: opts.type,
        accessToken,
      });
      const ok = status >= 200 && status < 300;
      console.log(
        `[sc-submit-wp] ${ok ? "OK" : "FAIL"} ${status} ${opts.type} ${url}${
          ok ? "" : ` :: ${body.slice(0, 200)}`
        }`,
      );
      history[url] = {
        lastSubmittedAt: new Date().toISOString(),
        lastType: opts.type,
        lastStatus: status,
      };
      if (!ok) hadError = true;
    } catch (e) {
      console.error(`[sc-submit-wp] ERROR ${url} :: ${e.message}`);
      history[url] = {
        lastSubmittedAt: new Date().toISOString(),
        lastType: opts.type,
        lastStatus: -1,
        lastError: String(e.message),
      };
      hadError = true;
    }
  }

  await writeHistory(history);

  if (hadError) process.exit(1);
}

main().catch((err) => {
  console.error("[sc-submit-wp] FATAL:", err?.stack ?? err);
  process.exit(1);
});
