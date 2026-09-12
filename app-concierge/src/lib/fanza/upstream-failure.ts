/**
 * E6① — 上流 FANZA API 失敗時の応答コードを 404 から 5xx へ（第124便 裁定5・案A・2026-09-12）。
 *
 * 設計条件（CSO 固定）:
 *   (a) 404 を返すのは「API が正常応答し、該当 item が存在しない」場合のみ。
 *       API リクエスト自体の失敗（400/5xx/タイムアウト/ネットワーク/設定事故）は
 *       throw → 各ルートの error.tsx → HTTP 500。真の不在まで 500 にしない。
 *   (c) VODNAVI_SILENT_DEATH_GUARD ログに served の応答コード（500）を含める。
 *   (d) stale-serve（fetchItemList 内・鮮度上限内のキャッシュ）が効く場合は fetch が
 *       resolve するため本モジュールは関与しない＝200 ステイルのまま。MISS 時のみ効く。
 *
 * 【単体テストのため next/* も client.ts も import しない】
 * 失敗の「種別」は判定に使わない——throw されたものはすべて「リクエスト失敗」であり、
 * 種別は (c) のログ項目としてだけ保持する。
 */

/** 多フロア巡回の 1 フロア分の結果。`null` は「正常応答・該当なし」。 */
export type FloorAttempt<R> = (floor: string) => Promise<R | null>;

export type FloorResolution<R> =
  | { kind: "found"; floor: string; value: R }
  | { kind: "empty"; floors: string[] };

/**
 * フロアを順に試し、最初に見つかったフロアの結果を返す。
 *   - 見つかった            → { kind: "found" }
 *   - 全フロアが正常応答・該当なし → { kind: "empty" }（呼び出し側が notFound()）
 *   - 1 フロアでも失敗し、かつ見つからなかった → 最後の失敗を throw（→ 500）
 *     ……失敗したフロアに該当があった可能性を排除できないため、「不在」と断定しない (a)。
 */
export async function resolveAcrossFloors<R>(
  floors: readonly string[],
  attempt: FloorAttempt<R>,
): Promise<FloorResolution<R>> {
  let lastError: unknown = undefined;
  let failed = false;
  const emptyFloors: string[] = [];
  for (const floor of floors) {
    let value: R | null;
    try {
      value = await attempt(floor);
    } catch (e) {
      failed = true;
      lastError = e;
      continue;
    }
    if (value !== null) return { kind: "found", floor, value };
    emptyFloors.push(floor);
  }
  if (failed) throw lastError;
  return { kind: "empty", floors: emptyFloors };
}

export type UpstreamErrorKind =
  | "api" // FanzaApiError（HTTP !ok または result.status >= 400）
  | "config" // FanzaConfigError（env 未設定）
  | "timeout" // AbortError
  | "network" // fetch 失敗（TypeError）
  | "unknown";

export function classifyUpstreamError(e: unknown): {
  kind: UpstreamErrorKind;
  upstreamStatus: number | null;
  name: string;
  message: string;
} {
  const err = e as { name?: unknown; message?: unknown; status?: unknown } | null;
  const name = typeof err?.name === "string" ? err.name : "Error";
  const message =
    typeof err?.message === "string" ? err.message.slice(0, 300) : String(e).slice(0, 300);
  const status = typeof err?.status === "number" ? err.status : null;
  let kind: UpstreamErrorKind = "unknown";
  if (name === "FanzaApiError") kind = "api";
  else if (name === "FanzaConfigError") kind = "config";
  else if (name === "AbortError" || name === "TimeoutError") kind = "timeout";
  else if (name === "TypeError") kind = "network";
  return { kind, upstreamStatus: status, name, message };
}

/**
 * (c) 本番のみ、GUARD と同じタグで「この失敗を 500 で返した」ことを射出する。
 * upstream 側の GUARD 行（client.ts）はリクエスト失敗の事実、本行は served の応答コード。
 * 成功基準（裁定5(c)）＝次に自然発生するバーストで、本行の served が 500 であること。
 * 【厳守】secret 値は扱わない（message は client.ts が既に安全化した文言のみ）。
 */
export function logUpstreamServed(
  context: string,
  error: unknown,
  served: number = 500,
  env: string | undefined = process.env.NODE_ENV,
  sink: (line: string) => void = console.error,
): void {
  if (env !== "production") return;
  const c = classifyUpstreamError(error);
  sink(
    JSON.stringify({
      level: "high",
      tag: "VODNAVI_SILENT_DEATH_GUARD",
      context,
      served,
      upstream_kind: c.kind,
      upstream_status: c.upstreamStatus,
      error_name: c.name,
      message: c.message,
      ts: new Date().toISOString(),
    }),
  );
}
