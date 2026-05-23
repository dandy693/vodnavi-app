/**
 * scripts/pull-ga4.ts — Saturday Review 用 GA4 データ取込スカフォールド
 *
 * AGENT_PROTOCOLS.md §週次データ駆動 PDCA ルーティン 1. に基づき、
 * GA4 プロパティ（解析アカウント moterist.com@gmail.com / authuser=2 配下）から
 * 先週 1 週間分の集計指標を取得し、management/_metrics/<YYYY-WW>/ga4-<YYYY-MM-DD>.json
 * へ JSON で書き出す。
 *
 * 起動：`npx tsx scripts/pull-ga4.ts` （tsx を dev-dep に追加するか、`node --import tsx` で実行）
 *
 * 認証経路（HUMAN 整備要、未配備のためデフォルトでは contract ダンプのみ実行）：
 *   - 推奨：Google Cloud で Analytics Data API を有効化、サービスアカウント JSON を発行、
 *           GOOGLE_APPLICATION_CREDENTIALS にパスを設定（ADC 経由で取れる）。
 *   - GA4 プロパティ側で対象サービスアカウント email に「閲覧者」権限付与必須。
 *   - GA4_PROPERTY_ID（数値、例：'350528001'）。プロパティ管理 > プロパティ詳細から取得。
 *
 * SDK 不採用の理由：repo に @google-analytics/data 等の dep を新規追加せず、
 * Data API v1beta の REST エンドポイントを直接 fetch する。本ファイル単独で完結。
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

// ---------- 型定義（contract）----------

/** GA4 Data API v1beta `runReport` の最小レスポンス型。 */
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

/** Saturday Review が消費する集計の最終形。 */
type Ga4WeeklySnapshot = {
  pulledAtIso: string;
  weekIso: string;
  dateRange: { startDate: string; endDate: string };
  propertyId: string;
  /** AGENT_PROTOCOLS.md §週次 PDCA 1. の `source × intent` 別セッション数。 */
  sessionsBySourceIntent: {
    source: string;
    intent: string;
    sessions: number;
  }[];
  /** カスタムイベント発火数（`ai_session_start` / `product_click` / `ai_affiliate_click`）。 */
  customEvents: {
    event: string;
    count: number;
  }[];
  /** ファネル算出（CVR = ai_affiliate_click / ai_session_start）。 */
  cvr: {
    aiSessionStart: number;
    aiAffiliateClick: number;
    rate: number | null;
  };
  /** API 未接続時の skeleton マーカー。HUMAN が接続したら false になる。 */
  isStub: boolean;
  notes: string[];
};

// ---------- 日付ヘルパ ----------

/** ISO 8601 週番号（YYYY-Www）と直近の月〜日範囲を算出。 */
function lastFullIsoWeek(now: Date): {
  weekIso: string;
  startDate: string;
  endDate: string;
} {
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  // 直近の日曜 23:59 までを「先週」とみなすため、まず今日が何曜日か確認。
  const dow = utc.getUTCDay(); // 0=Sun
  const daysSinceLastSunday = dow === 0 ? 7 : dow;
  const lastSun = new Date(utc);
  lastSun.setUTCDate(utc.getUTCDate() - daysSinceLastSunday);
  const lastMon = new Date(lastSun);
  lastMon.setUTCDate(lastSun.getUTCDate() - 6);

  // ISO 週番号：木曜日基準で年と週を計算（GA4 と齟齬のない一般化定義）。
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

// ---------- リクエストペイロード（HUMAN が接続後に有効化）----------

/**
 * runReport の payload 定義。AGENT_PROTOCOLS.md §週次 PDCA 1. の指標に対応。
 * GA4 のカスタムディメンション側で `source` と `intent` を実装している前提
 * （`?source=moterist&intent=beginner` の URL → イベントパラメータ → カスタムディメンション）。
 */
function buildRunReportPayload(startDate: string, endDate: string) {
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

// ---------- 実 API 呼び出し（auth 整備後に有効化）----------

/**
 * Data API v1beta runReport 呼び出し。
 * GOOGLE_APPLICATION_CREDENTIALS が設定済かつ access token 取得経路が整備済の場合のみ実行。
 *
 * 現状：repo に google-auth-library を新規追加せず、Bearer トークンの取得は HUMAN が
 * `gcloud auth application-default print-access-token` 等で発行した値を
 * `GA4_ACCESS_TOKEN` env-var に渡す方式を取る（短期トークン、scaffold 動作確認用）。
 * 本番運用化時に google-auth-library or ADC 経由でリフレッシュを自動化する。
 */
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

// ---------- メイン ----------

async function main() {
  const propertyId = process.env.GA4_PROPERTY_ID ?? "";
  const accessToken = process.env.GA4_ACCESS_TOKEN ?? "";
  const repoRoot = resolve(import.meta.dirname ?? process.cwd(), "..");

  const week = lastFullIsoWeek(new Date());
  const outPath = resolve(
    repoRoot,
    "management",
    "_metrics",
    week.weekIso,
    `ga4-${new Date().toISOString().slice(0, 10)}.json`,
  );

  const notes: string[] = [];
  let isStub = true;
  let sessionsBySourceIntent: Ga4WeeklySnapshot["sessionsBySourceIntent"] = [];
  let customEvents: Ga4WeeklySnapshot["customEvents"] = [];

  if (!propertyId) {
    notes.push("GA4_PROPERTY_ID 未設定 — schema ダンプのみ実行。");
  } else if (!accessToken) {
    notes.push(
      "GA4_ACCESS_TOKEN 未設定 — `gcloud auth application-default print-access-token` で短期発行し env に渡す or google-auth-library 配備要。",
    );
  } else {
    try {
      const sessionRes = await runReport(
        propertyId,
        accessToken,
        buildRunReportPayload(week.startDate, week.endDate),
      );
      sessionsBySourceIntent = (sessionRes.rows ?? []).map((row) => ({
        source: row.dimensionValues?.[0]?.value ?? "(unset)",
        intent: row.dimensionValues?.[1]?.value ?? "(unset)",
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
      }));

      const eventRes = await runReport(
        propertyId,
        accessToken,
        buildCustomEventCountPayload(week.startDate, week.endDate),
      );
      customEvents = (eventRes.rows ?? []).map((row) => ({
        event: row.dimensionValues?.[0]?.value ?? "",
        count: Number(row.metricValues?.[0]?.value ?? 0),
      }));
      isStub = false;
      notes.push("GA4 Data API runReport 2 本実行成功。");
    } catch (err) {
      notes.push(
        `GA4 fetch 失敗: ${err instanceof Error ? err.message : String(err)} — stub にフォールバック。`,
      );
    }
  }

  const startEvent = customEvents.find((e) => e.event === "ai_session_start");
  const clickEvent = customEvents.find((e) => e.event === "ai_affiliate_click");
  const startCount = startEvent?.count ?? 0;
  const clickCount = clickEvent?.count ?? 0;

  const snapshot: Ga4WeeklySnapshot = {
    pulledAtIso: new Date().toISOString(),
    weekIso: week.weekIso,
    dateRange: { startDate: week.startDate, endDate: week.endDate },
    propertyId: propertyId || "(unset)",
    sessionsBySourceIntent,
    customEvents,
    cvr: {
      aiSessionStart: startCount,
      aiAffiliateClick: clickCount,
      rate: startCount > 0 ? clickCount / startCount : null,
    },
    isStub,
    notes,
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`[pull-ga4] wrote ${outPath} (isStub=${isStub})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
