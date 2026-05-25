#!/usr/bin/env node
/**
 * scripts/audit-google-tools.mjs
 *
 * 3 大計測ツール（GA4 / GTM / Search Console）の本番物理監査スクリプト。
 *
 * 設計方針:
 *   - 外部 npm 依存ゼロ（Node 18+ の組み込み fetch のみ使用）。
 *   - ブラウザ自動化なし。HTML スクレイプで判定できる部分のみ自動化し、
 *     ログイン必須の Search Console / GA4 管理画面はレポート JSON 上で
 *     「authenticated browser に委譲」と明示し、ユーザの Chrome MCP 経由で
 *     人手検証する経路（mcp__claude-in-chrome__*）に渡せるよう URL を生成。
 *   - tsc/eslint は対象外（.mjs / scripts/ 配下に TS 設定なし）。
 *     構文検証は `node --check scripts/audit-google-tools.mjs` で行う。
 *
 * 監査対象:
 *   1) サイトトップ HTML に GA4 (G-GG7JV9MJRW) / GTM (GTM-*) スクリプトが
 *      物理的に挿入されているか
 *        - https://app.vodnavi.jp/  (Next.js)
 *        - https://vodnavi.jp/      (Next.js / 旧)
 *        - https://moterist.com/    (WordPress + the-thor-child)
 *   2) moterist.com の 6 大記事 (site-moterist/07_wp/posts/ から抽出) の
 *      HTTP ステータスと GA4 タグの存在
 *   3) Search Console / GA4 管理画面のチェック項目は、ログイン済み Chrome
 *      セッションへの引き渡し情報（URL + 期待値）を JSON に書き出す
 *
 * 出力:
 *   management/_metrics/google-tools-audit.json
 *
 * 使い方:
 *   node scripts/audit-google-tools.mjs              # 監査実行 + JSON 出力
 *   node scripts/audit-google-tools.mjs --print      # JSON を stdout にも出力
 *
 * 関連:
 *   - scripts/deploy-wp-seo-patch.sh
 *   - site-moterist/scripts/sc-submit-wp.mjs
 *   - app-concierge/src/components/google-tag-manager.tsx
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");
const OUTPUT_PATH = resolve(
  REPO_ROOT,
  "management",
  "_metrics",
  "google-tools-audit.json",
);

const EXPECTED_GA4_ID = "G-GG7JV9MJRW";
const REQUEST_TIMEOUT_MS = 15000;
const USER_AGENT =
  "vodnavi-audit/1.0 (+https://vodnavi.jp) Mozilla/5.0 compatible";

const SITES = [
  {
    kind: "next-app",
    url: "https://app.vodnavi.jp/",
    expectGtm: true,
    expectedEngine: "vercel-nextjs",
  },
  {
    kind: "next-marketing",
    url: "https://vodnavi.jp/",
    expectGtm: true,
    // 監査時点では vodnavi.jp の DNS は WordPress を指している (Server: LiteSpeed +
    // Link: wp-json)。site-brand への切替前は wordpress を期待値にする。
    // 切替後に vercel-nextjs に変更すること。
    expectedEngine: "wordpress",
  },
  {
    kind: "wp-thor",
    url: "https://moterist.com/",
    expectGtm: false,
    expectedEngine: "wordpress",
  },
];

const ARTICLE_SLUGS = [
  "fanza_premium_view",
  "fanza20250329",
  "fanza20250331",
  "fanza_actress_search",
  "fanza20250327",
  "fanza-4k-vr-luxury",
];

// ─────────────────────────────────────────────────────────────────
// fetch helpers
// ─────────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    const text = await res.text();
    const headers = {};
    for (const name of [
      "server",
      "x-vercel-cache",
      "x-vercel-id",
      "x-matched-path",
      "x-nextjs-cache",
      "age",
      "cache-control",
      "x-powered-by",
      "link",
    ]) {
      const v = res.headers.get(name);
      if (v) headers[name] = v;
    }
    return { status: res.status, finalUrl: res.url, body: text, headers };
  } catch (e) {
    return {
      status: -1,
      finalUrl: url,
      body: "",
      headers: {},
      error: String(e.message ?? e),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHead(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: ctrl.signal,
    });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: -1, finalUrl: url, error: String(e.message ?? e) };
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────
// tag detection
// ─────────────────────────────────────────────────────────────────

function detectGa4(html) {
  // G-XXXXXX (GA4 measurement ID). GT- は文法的に G- にマッチしないので排他。
  const ids = new Set();
  for (const m of html.matchAll(/\bG-[A-Z0-9]{6,}\b/g)) ids.add(m[0]);
  const hasGtagJs = /googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+/i.test(html);
  return {
    tagsFound: [...ids],
    hasGtagJsScript: hasGtagJs,
    expectedPresent: ids.has(EXPECTED_GA4_ID),
  };
}

/**
 * Google Tag (GT-XXXXXX) — Site Kit / Google Tag Gateway が WordPress 等から
 * 注入する「タグ ID」。G- (GA4 measurement) や GTM- (GTM container) とは別軸で、
 * Google サーバ側で複数 destination (GA4 / Ads / Floodlight) に fan-out する。
 * 検出してログするが、これは GTM-XXXX (本物の GTM コンテナ) の欠落を補わない。
 * → test gaming 排除: GT- がいても expectGtm 要件はあくまで GTM-XXXX を要求。
 */
function detectGtag(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\bGT-[A-Z0-9]{6,}\b/g)) ids.add(m[0]);
  const hasGtagJsScript = /googletagmanager\.com\/gtag\/js\?id=GT-[A-Z0-9]+/i.test(html);
  return {
    googleTagIdsFound: [...ids],
    hasGtagJsScript,
    present: ids.size > 0,
  };
}

function detectGtm(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\bGTM-[A-Z0-9]{4,}\b/g)) ids.add(m[0]);
  const hasGtmJsScript = /googletagmanager\.com\/gtm\.js\?id=GTM-[A-Z0-9]+/i.test(html);
  const hasInitScriptTag = /id=["']gtm-init["']/i.test(html);
  return {
    containerIdsFound: [...ids],
    hasGtmJsScript,
    hasInitScriptTag,
    present: ids.size > 0 || hasGtmJsScript || hasInitScriptTag,
  };
}

/**
 * Server / Link ヘッダから配信元エンジンを推定。
 * - Vercel: Server: Vercel / X-Vercel-* / X-Matched-Path
 * - WordPress: Server: LiteSpeed|Apache|nginx + Link: <.../wp-json/...> / X-Pingback
 */
function detectHostingEngine(headers) {
  const server = (headers.server || "").toLowerCase();
  const link = headers.link || "";
  const poweredBy = (headers["x-powered-by"] || "").toLowerCase();
  if (server.includes("vercel") || "x-vercel-id" in headers || "x-matched-path" in headers) {
    return { engine: "vercel-nextjs", evidence: { server, hasXVercelId: "x-vercel-id" in headers, hasXMatchedPath: "x-matched-path" in headers } };
  }
  if (/wp-json/.test(link) || poweredBy.includes("wordpress")) {
    return { engine: "wordpress", evidence: { server, link: link.slice(0, 200), poweredBy } };
  }
  return { engine: "unknown", evidence: { server, link: link.slice(0, 200) } };
}

// ─────────────────────────────────────────────────────────────────
// site audit
// ─────────────────────────────────────────────────────────────────

async function auditSite(site) {
  const r = await fetchHtml(site.url);
  const out = {
    kind: site.kind,
    url: site.url,
    status: r.status,
    finalUrl: r.finalUrl,
    hosting: detectHostingEngine(r.headers || {}),
    responseHeaders: r.headers || {},
  };
  if (r.error) {
    out.error = r.error;
    return out;
  }
  out.ga4 = detectGa4(r.body);
  out.gtag = detectGtag(r.body);
  out.gtm = detectGtm(r.body);

  // 期待された配信元（site.expectedEngine）と一致しない場合は警告。
  // 例: vodnavi.jp が Vercel (site-brand) を期待していたが WordPress を返している場合。
  if (site.expectedEngine && out.hosting.engine !== site.expectedEngine) {
    out.hostingMismatch = {
      expected: site.expectedEngine,
      actual: out.hosting.engine,
      implication:
        out.hosting.engine === "wordpress"
          ? "site-brand (Next.js) deploy is not serving this domain. WordPress + Site Kit is. The git-shipped <GoogleAnalytics>/<GoogleTagManager> mount will only take effect when DNS/Vercel domain assignment moves this domain to the Next.js app."
          : `Live engine is ${out.hosting.engine}; expected ${site.expectedEngine}.`,
    };
  }

  if (site.expectGtm && !out.gtm.present) {
    // GT- が居ても GTM- の不在は依然 FAIL。test gaming 排除。
    const gtNote = out.gtag.present
      ? ` Note: GT- (Google Tag Gateway) tag(s) ${JSON.stringify(out.gtag.googleTagIdsFound)} detected — these route to GA4 destinations server-side but do NOT satisfy the GTM container requirement.`
      : "";
    out.gtm.diagnosis =
      "Expected GTM container missing from live HTML. " +
      "Likely cause: NEXT_PUBLIC_GTM_ID not set in production env (Vercel). " +
      "Note: as of this audit, NEXT_PUBLIC_GTM_ID is referenced in code " +
      "(app-concierge/src/app/layout.tsx, site-brand/src/app/layout.tsx) but " +
      "NOT declared in app-concierge/.env.example — likely overlooked when " +
      "the human operator set Vercel env vars from the schema template." +
      gtNote;
  }
  return out;
}

async function auditArticle(slug) {
  const url = `https://moterist.com/${slug}/`;
  const r = await fetchHtml(url);
  const out = { slug, url, status: r.status, finalUrl: r.finalUrl };
  if (r.error) {
    out.error = r.error;
    return out;
  }
  out.ga4 = detectGa4(r.body);
  out.indexStatus = {
    method: "deferred-to-authenticated-browser",
    reason:
      "Search Console URL inspection requires logged-in Google session " +
      "(account: moterist.com@gmail.com per memory). DOM scrape against the " +
      "SPA is fragile; use Chrome MCP with active session instead.",
    inspectionUrl: `https://search.google.com/search-console/inspect?resource_id=sc-domain%3Amoterist.com&id=${encodeURIComponent(url)}`,
  };
  return out;
}

// ─────────────────────────────────────────────────────────────────
// WP sitemap users-provider regression check (for [[project_funnel_drop_off_seo_to_concierge]] linked SEO patch)
// ─────────────────────────────────────────────────────────────────

async function auditWpSitemapUsers() {
  const index = await fetchHtml("https://moterist.com/wp-sitemap.xml");
  const usersEntries = (index.body.match(/wp-sitemap-users-/g) || []).length;
  const direct = await fetchHtml("https://moterist.com/wp-sitemap-users-1.xml");
  const looksLikeUsersSitemapXml =
    /<urlset[^>]*>/i.test(direct.body) &&
    /<loc>[^<]*\/author\//i.test(direct.body);
  return {
    sitemapIndexStatus: index.status,
    usersEntriesInIndex: usersEntries,
    usersDirectStatus: direct.status,
    usersDirectIsValidSitemap: looksLikeUsersSitemapXml,
    passed:
      index.status === 200 &&
      usersEntries === 0 &&
      !looksLikeUsersSitemapXml,
    note:
      "Pass criteria: (1) wp-sitemap.xml has 0 users entries AND " +
      "(2) wp-sitemap-users-1.xml does not return a valid users urlset XML. " +
      "WP serves the homepage with 200 for unmatched sitemap paths (not 404), " +
      "which is acceptable because no users URLs are exposed to crawlers.",
  };
}

// ─────────────────────────────────────────────────────────────────
// env schema audit — code が参照する NEXT_PUBLIC_* と .env.example の差分
// ─────────────────────────────────────────────────────────────────

/**
 * 各 Next.js app の .env.example と layout.tsx を読み、
 * - layout が process.env.X を参照しているが .env.example に X が無い場合 FAIL
 * - これは Vercel 環境変数設定時にスキーマを見ながら投入する人間オペレーターが
 *   見落とす最も典型的な経路。本番に NEXT_PUBLIC_GTM_ID が居ない直接原因。
 */
async function auditEnvSchemas() {
  const apps = [
    {
      app: "app-concierge",
      envExample: resolve(REPO_ROOT, "app-concierge", ".env.example"),
      layout: resolve(REPO_ROOT, "app-concierge", "src", "app", "layout.tsx"),
    },
    {
      app: "site-brand",
      envExample: resolve(REPO_ROOT, "site-brand", ".env.example"),
      layout: resolve(REPO_ROOT, "site-brand", "src", "app", "layout.tsx"),
    },
  ];
  const results = [];
  for (const a of apps) {
    let envText = "";
    let envExists = true;
    try {
      envText = await readFile(a.envExample, "utf8");
    } catch (e) {
      envExists = false;
    }
    let layoutText = "";
    try {
      layoutText = await readFile(a.layout, "utf8");
    } catch {
      results.push({ app: a.app, error: "layout.tsx missing" });
      continue;
    }
    const referenced = new Set();
    for (const m of layoutText.matchAll(/process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)/g)) {
      referenced.add(m[1]);
    }
    const declared = new Set();
    if (envExists) {
      for (const line of envText.split(/\r?\n/)) {
        const m = line.match(/^([A-Z][A-Z0-9_]*)\s*=/);
        if (m) declared.add(m[1]);
      }
    }
    const missingInSchema = [...referenced].filter((k) => !declared.has(k));
    results.push({
      app: a.app,
      envExampleExists: envExists,
      referencedInLayout: [...referenced],
      declaredInEnvExample: [...declared].filter((k) => k.startsWith("NEXT_PUBLIC_")),
      missingFromEnvExample: missingInSchema,
      passed: envExists && missingInSchema.length === 0,
      diagnosis:
        missingInSchema.length > 0
          ? `${missingInSchema.join(", ")} referenced in layout.tsx but absent from .env.example. ` +
            `Human operator setting Vercel env vars by reading the schema would not know to add these.`
          : envExists
            ? "Schema and code references aligned."
            : ".env.example missing — operator has no schema to follow.",
    });
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────
// authenticated-browser handoff (Search Console + GA4 admin)
// ─────────────────────────────────────────────────────────────────

function buildAuthenticatedHandoff(articles) {
  return {
    search_console: {
      account_required: "moterist.com@gmail.com (per memory reference_google_accounts)",
      tool_to_use: "mcp__claude-in-chrome__navigate + read_page",
      property: "sc-domain:moterist.com",
      urls_to_inspect: articles.map((a) => ({
        url: a.url,
        inspectionUrl: a.indexStatus?.inspectionUrl,
        dom_targets: [
          'div[aria-label="URL is on Google"] / "URL is not on Google" の本文',
          '"Coverage" / "Discovery" / "Crawl" セクション内のステータス文字列',
          'インデックス未登録の場合の理由テキスト ("検出 - 未インデックス" / "クロール済み - 未インデックス" 等)',
        ],
      })),
    },
    ga4_admin: {
      account_required: "moterist.com@gmail.com",
      tool_to_use: "mcp__claude-in-chrome__navigate + read_page",
      property_id: "p489519780",
      property_label: "vodnavi.jp (GA4)",
      measurement_id: EXPECTED_GA4_ID,
      custom_definitions_url:
        "https://analytics.google.com/analytics/web/#/p489519780/admin/customdefinitions/hub",
      dimensions_to_verify: [
        {
          parameter_name: "asp_name",
          scope: "event",
          source_event: "early_cookie_burn (per commit bab2bfc)",
          why: "型付きヘルパー化で送信は保証されたが、カスタムディメンションが " +
            "未登録なら GA4 レポート側で集計軸として現れない。",
          memory_link: "[[project_fanza_cta_blank_state]] / [[project_funnel_drop_off_seo_to_concierge]]",
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────────

async function main() {
  const printJson = process.argv.includes("--print");

  const [sites, articles, wpSitemap, envSchemas] = await Promise.all([
    Promise.all(SITES.map(auditSite)),
    Promise.all(ARTICLE_SLUGS.map(auditArticle)),
    auditWpSitemapUsers(),
    auditEnvSchemas(),
  ]);

  const handoff = buildAuthenticatedHandoff(articles);

  const passedSites = sites.filter(
    (s) => s.status >= 200 && s.status < 400 && s.ga4?.expectedPresent,
  ).length;
  const gtmFailed = sites.filter(
    (s) => SITES.find((cfg) => cfg.url === s.url)?.expectGtm && !s.gtm?.present,
  );
  const gtagGatewaySites = sites.filter((s) => s.gtag?.present);
  const hostingMismatches = sites.filter((s) => s.hostingMismatch);

  const report = {
    generatedAt: new Date().toISOString(),
    expectedGa4Id: EXPECTED_GA4_ID,
    summary: {
      sitesAudited: sites.length,
      sitesWithExpectedGa4: passedSites,
      gtmExpectedButMissing: gtmFailed.map((s) => s.url),
      gtagGatewayDetectedAt: gtagGatewaySites.map((s) => ({
        url: s.url,
        ids: s.gtag.googleTagIdsFound,
      })),
      hostingMismatches: hostingMismatches.map((s) => ({
        url: s.url,
        expected: s.hostingMismatch.expected,
        actual: s.hostingMismatch.actual,
      })),
      envSchemaIssues: envSchemas.filter((e) => !e.passed).map((e) => ({
        app: e.app,
        missing: e.missingFromEnvExample,
      })),
      articlesAudited: articles.length,
      articlesReachable: articles.filter(
        (a) => a.status >= 200 && a.status < 400,
      ).length,
      wpUsersSitemapPatchApplied: wpSitemap.passed,
    },
    sites,
    articles,
    wpSitemap,
    envSchemas,
    deferredToAuthenticatedBrowser: handoff,
    notes: [
      "Generated by scripts/audit-google-tools.mjs (zero npm deps, Node fetch).",
      "Search Console / GA4 admin checks intentionally deferred — they require an authenticated Google session and a stable DOM. Use the Chrome MCP tools listed in deferredToAuthenticatedBrowser.",
      "Re-run this script after each production deploy to detect regressions.",
    ],
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(`[audit-google-tools] wrote ${OUTPUT_PATH}`);
  console.log(
    `[audit-google-tools] sites GA4=${passedSites}/${sites.length} GTM-missing=${gtmFailed.length} GT-detected=${gtagGatewaySites.length} hostingMismatch=${hostingMismatches.length} envSchemaIssues=${report.summary.envSchemaIssues.length} articles reachable=${report.summary.articlesReachable}/${articles.length} wpUsersSitemapPatched=${wpSitemap.passed}`,
  );

  if (printJson) {
    console.log("---");
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((err) => {
  console.error("[audit-google-tools] FATAL:", err?.stack ?? err);
  process.exit(1);
});
