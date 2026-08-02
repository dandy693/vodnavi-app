#!/usr/bin/env node
/**
 * S4 回帰ブロック — af_id の用途混線を CI で検出して失敗させる（c237e51 と同型）。
 *
 * 台帳（reference_dmm_affiliate_id_registry）の不変条件:
 *   - 990〜999 = DMM API 専用 ID。**人間導線（href）への使用は禁止**
 *   - 004      = app.vodnavi.jp の人間 CTA
 *   - JSON-LD / 構造化データに af_id 入り URL を書かない
 *     （2026-06-24 のクリック25倍事故の主因経路。c237e51 で是正済み）
 *
 * 2 モード:
 *   --static (既定) … ネットワーク不要。ソースを走査し、回帰を生むコード形状を検出。
 *                      push / pull_request で毎回実行できる。
 *   --live          … 本番（既定 https://app.vodnavi.jp）を取得し、実際に描画された
 *                      href / JSON-LD を検査する。デプロイ後・定期実行用。
 *
 * 使い方:
 *   node app-concierge/scripts/guard-affiliate-id.mjs --static
 *   node app-concierge/scripts/guard-affiliate-id.mjs --live [--base https://app.vodnavi.jp]
 *
 * 終了コード: 0 = 合格 / 1 = 違反あり（CI 失敗）/ 2 = 検査自体を実行できなかった
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, "..");
const SRC_ROOT = join(APP_ROOT, "src");

/** 人間導線に出てはならない af_id（990〜999）。 */
const FORBIDDEN_AF_ID = /af_id=(?:[a-z0-9-]*-)?99\d\b/i;
/** URL エンコード / RSC エスケープ形も拾う。 */
const FORBIDDEN_AF_ID_ANY = /af_id(?:=|%3D|\\u003d)(?:[a-z0-9-]*-)?99\d\b/i;

const failures = [];
const notes = [];

function fail(where, message) {
  failures.push(`${where}: ${message}`);
}

// =====================================================================
// static モード
// =====================================================================

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

/** 行からコメント部分を落とす（禁則を説明するコメントを違反にしないため）。 */
function stripComment(line) {
  return line
    .replace(/\/\/.*$/, "")
    .replace(/\/\*.*?\*\//g, "")
    .replace(/^\s*\*.*$/, "");
}

function runStatic() {
  const files = walk(SRC_ROOT);
  notes.push(`走査対象: ${files.length} ファイル (${relative(APP_ROOT, SRC_ROOT)})`);

  for (const file of files) {
    const rel = relative(APP_ROOT, file).replace(/\\/g, "/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);

    lines.forEach((raw, i) => {
      const line = stripComment(raw);
      const at = `${rel}:${i + 1}`;

      // (1) af_id のハードコード（ビルダの `af_id=${af}` テンプレートのみ許可）
      if (/af_id=/.test(line) && !/af_id=\$\{/.test(line)) {
        fail(at, `af_id をハードコードしている: ${line.trim()}`);
      }

      // (2) 990〜999 系 ID の直書き
      if (FORBIDDEN_AF_ID_ANY.test(line) || /moterist-99\d\b/.test(line)) {
        fail(at, `API 専用 ID(99x) を直書きしている: ${line.trim()}`);
      }

      // (3) href に API 返却の affiliateURL を直渡ししている
      //     （S4 以前の形。API の affiliateURL は af_id=990 を含む）
      if (/href=\{[^}]*\baffiliateURL\b/.test(line)) {
        fail(
          at,
          `href へ API 返却の affiliateURL を直渡ししている（S4 回帰）。` +
            `buildAffiliateURL().primaryUrl を使うこと: ${line.trim()}`,
        );
      }

      // (4) JSON-LD 生成部に affiliate URL を載せている（c237e51 の回帰）
      //     Offer.url / ItemList の url に af_id 入り URL を置くと bot fetch で
      //     DMM 側クリックが計上される。
      if (/\burl:\s*[^,\n]*\baffiliateURL\b/.test(line)) {
        fail(
          at,
          `構造化データ(JSON-LD)の url に affiliateURL を置いている（c237e51 回帰）: ${line.trim()}`,
        );
      }
    });
  }

  if (failures.length === 0) {
    notes.push("static: href への affiliateURL 直渡し 0 件 / af_id ハードコード 0 件");
  }
}

// =====================================================================
// live モード
// =====================================================================

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "vodnavi-affiliate-guard/1.0" },
    redirect: "follow",
  });
  const body = await res.text();
  return { status: res.status, body };
}

/** <script> ブロックを除いた「素の HTML」= 実際に人間がクリックする href のみ。 */
function plainHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "");
}

function hrefsOf(html) {
  return [...plainHtml(html).matchAll(/href="([^"]+)"/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
}

function jsonLdBlocksOf(html) {
  return [
    ...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((m) => m[1]);
}

async function runLive(base) {
  notes.push(`live 検査対象ベース: ${base}`);

  // 検査面を可視の sitemap から解決する（URL 推測をしない）。
  const sitemap = await get(`${base}/sitemap.xml`);
  if (sitemap.status !== 200) {
    console.error(`sitemap.xml が ${sitemap.status}。検査を実行できない。`);
    process.exit(2);
  }
  const pick = (re) => (sitemap.body.match(re) || [])[0] ?? null;
  const genresUrl = pick(/https:\/\/[^<]*\/genres\/\d+/);
  const actressesUrl = pick(/https:\/\/[^<]*\/actresses\/\d+/);
  const workUrl = pick(/https:\/\/[^<]*\/works\/[a-z]+\/[a-zA-Z0-9_]+/);

  const top = await get(`${base}/`);
  // concierge の作品カードはトップに出ている cid で再現する。
  const cids = [...plainHtml(top.body).matchAll(/href="\/works\/[a-z]+\/([a-zA-Z0-9_]+)"/g)]
    .map((m) => m[1])
    .slice(0, 3);

  const targets = [
    { name: "top", url: `${base}/`, html: top.body, status: top.status },
  ];
  for (const [name, url] of [
    ["genres", genresUrl],
    ["actresses", actressesUrl],
    ["works(detail)", workUrl],
    [
      "concierge",
      cids.length > 0 ? `${base}/concierge?cids=${cids.join(",")}` : null,
    ],
  ]) {
    if (!url) {
      fail("live", `${name} の検査 URL を sitemap / トップから解決できなかった`);
      continue;
    }
    const r = await get(url);
    targets.push({ name, url, html: r.body, status: r.status });
  }

  for (const t of targets) {
    if (t.status !== 200) {
      fail("live", `${t.name} が HTTP ${t.status}（${t.url}）`);
      continue;
    }

    // (1) href 内に 99x が出てはならない
    const bad = hrefsOf(t.html).filter((h) => FORBIDDEN_AF_ID.test(h));
    if (bad.length > 0) {
      fail(
        "live",
        `${t.name}: href 内に API 専用 af_id(99x) が ${bad.length} 件 — 例: ${bad[0]}`,
      );
    }

    // (2) JSON-LD に af_id を含めてはならない（c237e51 の既存禁則）
    const ld = jsonLdBlocksOf(t.html);
    const badLd = ld.filter((b) => /af_id/i.test(b));
    if (badLd.length > 0) {
      fail(
        "live",
        `${t.name}: JSON-LD ${badLd.length} ブロックに af_id が含まれる（c237e51 回帰）`,
      );
    }

    const total = hrefsOf(t.html).filter((h) =>
      /al\.(dmm|fanza)\.co\.jp/.test(h),
    ).length;
    notes.push(
      `${t.name}: アフィリエイト href ${total} 本 / 99x ${bad.length} 件 / JSON-LD ${ld.length} ブロック(af_id ${badLd.length})`,
    );
  }
}

// =====================================================================

const argv = process.argv.slice(2);
const live = argv.includes("--live");
const baseIdx = argv.indexOf("--base");
const base =
  (baseIdx >= 0 ? argv[baseIdx + 1] : null) ??
  process.env.GUARD_BASE ??
  "https://app.vodnavi.jp";

if (live) {
  await runLive(base.replace(/\/$/, ""));
} else {
  runStatic();
}

for (const n of notes) console.log(`  · ${n}`);

if (failures.length > 0) {
  console.error(`\n✗ af_id ガード違反 ${failures.length} 件`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    "\n台帳: 990〜999 は DMM API 専用。人間導線(href)は 004。JSON-LD に af_id を書かない。",
  );
  process.exit(1);
}

console.log(`\n✓ af_id ガード合格（${live ? "live" : "static"}）`);
