/**
 * scripts/pull-ga4.ts — GA4 データ取込スカフォールド (Saturday Review + W22 SR 拡張)
 *
 * 基本: AGENT_PROTOCOLS.md §週次データ駆動 PDCA ルーティン 1. に基づき、
 * 先週 1 週間分の `source × intent` 別セッション数とカスタムイベント数を JSON 化。
 *
 * 2026-W22 拡張 (T-03-SR2 / SR3 / SR4):
 *   - `--hostname`              hostName dimension で moterist.com vs app.vodnavi.jp 物理分離 (SR2)
 *   - `--audit-dimensions`      asp_name / source / intent の受信状態を distinct value + (not set) 列挙 (SR3)
 *   - `--start=YYYY-MM-DD`      開始日上書き (省略時は lastFullIsoWeek)
 *   - `--end=YYYY-MM-DD`        終了日上書き
 *   - `--week-iso=YYYY-Www`     出力ディレクトリの週 ISO 上書き
 *
 * 起動例:
 *   npx tsx scripts/pull-ga4.ts                                       # 既定: 先週分
 *   npx tsx scripts/pull-ga4.ts --start=2026-05-01 --end=2026-05-31 --week-iso=2026-W22 --hostname --audit-dimensions
 *
 * 認証経路 (HUMAN 整備要、未配備のため env なしならスタブ実行):
 *   - GA4 プロパティ側で対象サービスアカウント email に「閲覧者」権限付与必須
 *   - GA4_PROPERTY_ID (数値、例: '489519780'。memory: vodnavi.jp 統合プロパティ)
 *   - GA4_ACCESS_TOKEN (短期、`gcloud auth application-default print-access-token` で発行)
 *
 * SDK 不採用: @google-analytics/data 等の dep を新規追加せず、Data API v1beta の REST を直接 fetch
 *
 * 出力: `_metrics/<week-iso>/ga4-<YYYY-MM-DD>.json`
 *   (2026-05-31 raw_audit_report.md と同じ root `_metrics/` 配下に揃える)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

// ---------- 型定義 (contract) ----------

type Ga4RunReportResponse = {
  dimensionHeaders?: { name: string }[];
  metricHeaders?: { name: string; type?: string }[];
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
  rowCount?: number;
  metadata?: Record<string, unknown>;
};

type HostNameRow = {
  hostName: string;
  screenPageViews: number;
  sessions: number;
};

type CustomDimensionAuditRow = {
  dimensionName: string;
  distinctValues: { value: string; eventCount: number }[];
  notSetEventCount: number;
  totalDistinct: number;
  totalEventCount: number;
};

type Ga4WeeklySnapshot = {
  pulledAtIso: string;
  weekIso: string;
  dateRange: { startDate: string; endDate: string };
  propertyId: string;
  /** AGENT_PROTOCOLS.md §週次 PDCA 1. の `source × intent` 別セッション数 */
  sessionsBySourceIntent: {
    source: string;
    intent: string;
    sessions: number;
  }[];
  /** カスタムイベント発火数 (ai_session_start / product_click / ai_affiliate_click) */
  customEvents: { event: string; count: number }[];
  cvr: {
    aiSessionStart: number;
    aiAffiliateClick: number;
    rate: number | null;
  };
  /** SR2: hostName dimension 分解 (moterist.com vs app.vodnavi.jp) */
  hostNameSplit?: HostNameRow[];
  /** SR3: asp_name / source / intent 受信状態 audit ((not set) 含む) */
  customDimensionAudit?: CustomDimensionAuditRow[];
  isStub: boolean;
  notes: string[];
};

// ---------- CLI args ----------

type CliArgs = {
  startDate?: string;
  endDate?: string;
  weekIso?: string;
  hostName: boolean;
  auditDimensions: boolean;
};

function parseCliArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const getEq = (prefix: string): string | undefined => {
    const hit = args.find((a) => a.startsWith(`${prefix}=`));
    return hit?.slice(prefix.length + 1);
  };
  return {
    startDate: getEq("--start"),
    endDate: getEq("--end"),
    weekIso: getEq("--week-iso"),
    hostName: args.includes("--hostname"),
    auditDimensions: args.includes("--audit-dimensions"),
  };
}

// ---------- 日付ヘルパ ----------

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

function isoWeekOfDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const utc = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const thursday = new Date(
    Date.UTC(
      utc.getUTCFullYear(),
      utc.getUTCMonth(),
      utc.getUTCDate() + ((4 - utc.getUTCDay() + 7) % 7),
    ),
  );
  const year = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

// ---------- リクエストペイロード ----------

function buildSourceIntentPayload(startDate: string, endDate: string) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "customEvent:source" },
      { name: "customEvent:intent" },
    ],
    metrics: [{ name: "sessions" }],
    limit: 1000,
    keepEmptyRows: false,
  };
}

function buildCustomEventCountPayload(startDate: string, endDate: string) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: ["ai_session_start", "product_click", "ai_affiliate_click"],
        },
      },
    },
    limit: 10,
  };
}

/** SR2: hostName dimension で moterist.com vs app.vodnavi.jp を分離 */
function buildHostNamePayload(startDate: string, endDate: string) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "hostName" }],
    metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
    limit: 100,
    keepEmptyRows: false,
  };
}

/** SR3: 任意の custom dimension の distinct value 列挙 ((not set) 含む) */
function buildCustomDimensionAuditPayload(
  startDate: string,
  endDate: string,
  dimensionName: string,
) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: `customEvent:${dimensionName}` }],
    metrics: [{ name: "eventCount" }],
    limit: 200,
    keepEmptyRows: true,
  };
}

// ---------- API 呼び出し ----------

async function runReport(
  propertyId: string,
  accessToken: string,
  payload: Record<string, unknown>,
): Promise<Ga4RunReportResponse> {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
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
    throw new Error(`GA4 runReport ${res.status}: ${body.slice(0, 500)}`);
  }
  return (await res.json()) as Ga4RunReportResponse;
}

// ---------- 集計ヘルパ ----------

function summariseHostName(res: Ga4RunReportResponse): HostNameRow[] {
  return (res.rows ?? []).map((row) => ({
    hostName: row.dimensionValues?.[0]?.value ?? "(unset)",
    screenPageViews: Number(row.metricValues?.[0]?.value ?? 0),
    sessions: Number(row.metricValues?.[1]?.value ?? 0),
  }));
}

function summariseCustomDimensionAudit(
  dimensionName: string,
  res: Ga4RunReportResponse,
): CustomDimensionAuditRow {
  const rows = (res.rows ?? []).map((row) => ({
    value: row.dimensionValues?.[0]?.value ?? "(unset)",
    eventCount: Number(row.metricValues?.[0]?.value ?? 0),
  }));
  const notSet = rows.find((r) =>
    ["(not set)", "(unset)", ""].includes(r.value),
  );
  const populated = rows.filter(
    (r) => !["(not set)", "(unset)", ""].includes(r.value),
  );
  return {
    dimensionName,
    distinctValues: populated.sort((a, b) => b.eventCount - a.eventCount),
    notSetEventCount: notSet?.eventCount ?? 0,
    totalDistinct: populated.length,
    totalEventCount: rows.reduce((sum, r) => sum + r.eventCount, 0),
  };
}

// ---------- メイン ----------

async function main() {
  const cli = parseCliArgs(process.argv);
  const propertyId = process.env.GA4_PROPERTY_ID ?? "";
  const accessToken = process.env.GA4_ACCESS_TOKEN ?? "";
  const repoRoot = resolve(import.meta.dirname ?? process.cwd(), "..");

  // 期間決定: CLI > env > lastFullIsoWeek
  const defaultWeek = lastFullIsoWeek(new Date());
  const startDate = cli.startDate ?? defaultWeek.startDate;
  const endDate = cli.endDate ?? defaultWeek.endDate;
  const weekIso =
    cli.weekIso ?? (cli.startDate ? isoWeekOfDate(cli.startDate) : defaultWeek.weekIso);

  const outPath = resolve(
    repoRoot,
    "_metrics",
    weekIso,
    `ga4-${new Date().toISOString().slice(0, 10)}.json`,
  );

  const notes: string[] = [];
  let isStub = true;
  let sessionsBySourceIntent: Ga4WeeklySnapshot["sessionsBySourceIntent"] = [];
  let customEvents: Ga4WeeklySnapshot["customEvents"] = [];
  let hostNameSplit: HostNameRow[] | undefined;
  let customDimensionAudit: CustomDimensionAuditRow[] | undefined;

  if (!propertyId) {
    notes.push("GA4_PROPERTY_ID 未設定 — schema ダンプのみ実行");
  } else if (!accessToken) {
    notes.push(
      "GA4_ACCESS_TOKEN 未設定 — `gcloud auth application-default print-access-token` で短期発行し env に渡す",
    );
  } else {
    try {
      const sessionRes = await runReport(
        propertyId,
        accessToken,
        buildSourceIntentPayload(startDate, endDate),
      );
      sessionsBySourceIntent = (sessionRes.rows ?? []).map((row) => ({
        source: row.dimensionValues?.[0]?.value ?? "(unset)",
        intent: row.dimensionValues?.[1]?.value ?? "(unset)",
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
      }));

      const eventRes = await runReport(
        propertyId,
        accessToken,
        buildCustomEventCountPayload(startDate, endDate),
      );
      customEvents = (eventRes.rows ?? []).map((row) => ({
        event: row.dimensionValues?.[0]?.value ?? "",
        count: Number(row.metricValues?.[0]?.value ?? 0),
      }));
      notes.push("runReport (source×intent / customEvents) 取得成功");

      // SR2: hostName 分解
      if (cli.hostName) {
        const hostRes = await runReport(
          propertyId,
          accessToken,
          buildHostNamePayload(startDate, endDate),
        );
        hostNameSplit = summariseHostName(hostRes);
        notes.push(`SR2 hostName 分解: ${hostNameSplit.length} ホスト取得`);
      }

      // SR3: カスタム dim 受信 audit
      if (cli.auditDimensions) {
        customDimensionAudit = [];
        for (const dim of ["asp_name", "source", "intent"]) {
          try {
            const auditRes = await runReport(
              propertyId,
              accessToken,
              buildCustomDimensionAuditPayload(startDate, endDate, dim),
            );
            customDimensionAudit.push(
              summariseCustomDimensionAudit(dim, auditRes),
            );
          } catch (e) {
            notes.push(
              `SR3 audit [${dim}] 失敗: ${e instanceof Error ? e.message : String(e)} (dimension 未登録の可能性)`,
            );
          }
        }
        notes.push(
          `SR3 audit: ${customDimensionAudit.length}/3 dimensions queried`,
        );
      }

      isStub = false;
    } catch (err) {
      notes.push(
        `GA4 fetch 失敗: ${err instanceof Error ? err.message : String(err)} — stub にフォールバック`,
      );
    }
  }

  const startEvent = customEvents.find((e) => e.event === "ai_session_start");
  const clickEvent = customEvents.find((e) => e.event === "ai_affiliate_click");
  const startCount = startEvent?.count ?? 0;
  const clickCount = clickEvent?.count ?? 0;

  const snapshot: Ga4WeeklySnapshot = {
    pulledAtIso: new Date().toISOString(),
    weekIso,
    dateRange: { startDate, endDate },
    propertyId: propertyId || "(unset)",
    sessionsBySourceIntent,
    customEvents,
    cvr: {
      aiSessionStart: startCount,
      aiAffiliateClick: clickCount,
      rate: startCount > 0 ? clickCount / startCount : null,
    },
    hostNameSplit,
    customDimensionAudit,
    isStub,
    notes,
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`[pull-ga4] wrote ${outPath} (isStub=${isStub})`);
  if (cli.hostName) console.log(`  hostNameSplit=${hostNameSplit?.length ?? 0}`);
  if (cli.auditDimensions)
    console.log(`  customDimensionAudit=${customDimensionAudit?.length ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
