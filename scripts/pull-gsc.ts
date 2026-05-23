/**
 * scripts/pull-gsc.ts — Saturday Review 用 Search Console データ取込スカフォールド
 *
 * AGENT_PROTOCOLS.md §週次データ駆動 PDCA ルーティン 1. に基づき、
 * Search Console プロパティ 2 つ（sc-domain:vodnavi.jp / sc-domain:moterist.com）から
 * クエリ別の表示回数・CTR・平均掲載順位、およびサイトマップ discovery 状態を取得し、
 * management/_metrics/<YYYY-WW>/gsc-<YYYY-MM-DD>.json に JSON で書き出す。
 *
 * 起動：`npx tsx scripts/pull-gsc.ts`
 *
 * 認証経路（HUMAN 整備要、未配備のためデフォルトでは contract ダンプのみ実行）：
 *   - GCP で Search Console API を有効化、サービスアカウント JSON 発行。
 *   - GSC プロパティ側「設定 > ユーザーと権限」で当該サービスアカウントを「制限付き」以上で追加。
 *   - GSC_SITES（カンマ区切り、例：'sc-domain:vodnavi.jp,sc-domain:moterist.com'）。
 *   - GSC_ACCESS_TOKEN：pull-ga4.ts と同じく短期 access token。本番化時は google-auth-library で自動化。
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

// ---------- 型定義（contract）----------

type GscSearchAnalyticsResponse = {
  rows?: {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }[];
};

type GscSitemapsListResponse = {
  sitemap?: {
    path?: string;
    lastSubmitted?: string;
    isPending?: boolean;
    isSitemapsIndex?: boolean;
    type?: string;
    lastDownloaded?: string;
    warnings?: string;
    errors?: string;
    contents?: {
      type?: string;
      submitted?: string; // GSC が示す「送信済 URL 数」
      indexed?: string; // GSC が示す「インデックス済 URL 数」（Discovery とは別）
    }[];
  }[];
};

type GscPerSiteSnapshot = {
  site: string;
  topQueries: {
    query: string;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  /** 11〜20 位に落ちたクエリ（IG 強化指示の対象、AGENT_PROTOCOLS §週次 PDCA 3.）。 */
  slippingQueries: {
    query: string;
    impressions: number;
    position: number;
  }[];
  sitemaps: {
    path: string;
    lastSubmitted: string | null;
    lastDownloaded: string | null;
    submittedUrls: number | null;
    indexedUrls: number | null;
    isPending: boolean;
    warnings: number;
    errors: number;
  }[];
};

type GscWeeklySnapshot = {
  pulledAtIso: string;
  weekIso: string;
  dateRange: { startDate: string; endDate: string };
  sites: GscPerSiteSnapshot[];
  isStub: boolean;
  notes: string[];
};

// ---------- 日付ヘルパ（pull-ga4.ts と同一実装）----------

function lastFullIsoWeek(now: Date): {
  weekIso: string;
  startDate: string;
  endDate: string;
} {
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dow = utc.getUTCDay();
  const daysSinceLastSunday = dow === 0 ? 7 : dow;
  const lastSun = new Date(utc);
  lastSun.setUTCDate(utc.getUTCDate() - daysSinceLastSunday);
  const lastMon = new Date(lastSun);
  lastMon.setUTCDate(lastSun.getUTCDate() - 6);
  const thursday = new Date(
    Date.UTC(
      lastMon.getUTCFullYear(),
      lastMon.getUTCMonth(),
      lastMon.getUTCDate() + ((4 - lastMon.getUTCDay() + 7) % 7),
    ),
  );
  const year = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return {
    weekIso: `${year}-W${String(weekNum).padStart(2, "0")}`,
    startDate: lastMon.toISOString().slice(0, 10),
    endDate: lastSun.toISOString().slice(0, 10),
  };
}

// ---------- リクエストペイロード ----------

function buildSearchAnalyticsPayload(startDate: string, endDate: string) {
  return {
    startDate,
    endDate,
    dimensions: ["query"],
    rowLimit: 1000,
    dataState: "final" as const,
  };
}

// ---------- API 呼び出し ----------

async function searchAnalyticsQuery(
  site: string,
  accessToken: string,
  payload: Record<string, unknown>,
): Promise<GscSearchAnalyticsResponse> {
  const encoded = encodeURIComponent(site);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GSC searchAnalytics ${site} ${res.status}: ${body.slice(0, 500)}`,
    );
  }
  return (await res.json()) as GscSearchAnalyticsResponse;
}

async function sitemapsList(
  site: string,
  accessToken: string,
): Promise<GscSitemapsListResponse> {
  const encoded = encodeURIComponent(site);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GSC sitemaps.list ${site} ${res.status}: ${body.slice(0, 500)}`,
    );
  }
  return (await res.json()) as GscSitemapsListResponse;
}

// ---------- 集計ロジック ----------

function summarisePerSite(
  site: string,
  search: GscSearchAnalyticsResponse,
  sitemaps: GscSitemapsListResponse,
): GscPerSiteSnapshot {
  const rows = (search.rows ?? []).map((r) => ({
    query: r.keys?.[0] ?? "",
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));

  rows.sort((a, b) => b.impressions - a.impressions);
  const topQueries = rows.slice(0, 50);

  const slippingQueries = rows
    .filter((r) => r.position > 10 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30)
    .map((r) => ({
      query: r.query,
      impressions: r.impressions,
      position: r.position,
    }));

  const sitemapSummary = (sitemaps.sitemap ?? []).map((sm) => {
    const submitted = sm.contents?.find((c) => c.type === "web")?.submitted;
    const indexed = sm.contents?.find((c) => c.type === "web")?.indexed;
    return {
      path: sm.path ?? "",
      lastSubmitted: sm.lastSubmitted ?? null,
      lastDownloaded: sm.lastDownloaded ?? null,
      submittedUrls: submitted ? Number(submitted) : null,
      indexedUrls: indexed ? Number(indexed) : null,
      isPending: Boolean(sm.isPending),
      warnings: sm.warnings ? Number(sm.warnings) : 0,
      errors: sm.errors ? Number(sm.errors) : 0,
    };
  });

  return {
    site,
    topQueries,
    slippingQueries,
    sitemaps: sitemapSummary,
  };
}

// ---------- メイン ----------

async function main() {
  const sites = (process.env.GSC_SITES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const accessToken = process.env.GSC_ACCESS_TOKEN ?? "";
  const repoRoot = resolve(import.meta.dirname ?? process.cwd(), "..");

  const week = lastFullIsoWeek(new Date());
  const outPath = resolve(
    repoRoot,
    "management",
    "_metrics",
    week.weekIso,
    `gsc-${new Date().toISOString().slice(0, 10)}.json`,
  );

  const notes: string[] = [];
  const perSite: GscPerSiteSnapshot[] = [];
  let isStub = true;

  if (sites.length === 0) {
    notes.push(
      "GSC_SITES 未設定 — schema ダンプのみ実行。期待値：'sc-domain:vodnavi.jp,sc-domain:moterist.com'。",
    );
  } else if (!accessToken) {
    notes.push("GSC_ACCESS_TOKEN 未設定 — pull-ga4.ts と同じ手順で発行要。");
  } else {
    for (const site of sites) {
      try {
        const search = await searchAnalyticsQuery(
          site,
          accessToken,
          buildSearchAnalyticsPayload(week.startDate, week.endDate),
        );
        const sitemaps = await sitemapsList(site, accessToken);
        perSite.push(summarisePerSite(site, search, sitemaps));
      } catch (err) {
        notes.push(
          `GSC fetch 失敗 [${site}]: ${err instanceof Error ? err.message : String(err)}`,
        );
        perSite.push({
          site,
          topQueries: [],
          slippingQueries: [],
          sitemaps: [],
        });
      }
    }
    isStub = perSite.every((s) => s.topQueries.length === 0);
    if (!isStub) {
      notes.push(`GSC searchAnalytics + sitemaps を ${sites.length} サイト分取得。`);
    }
  }

  const snapshot: GscWeeklySnapshot = {
    pulledAtIso: new Date().toISOString(),
    weekIso: week.weekIso,
    dateRange: { startDate: week.startDate, endDate: week.endDate },
    sites: perSite,
    isStub,
    notes,
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`[pull-gsc] wrote ${outPath} (isStub=${isStub})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
