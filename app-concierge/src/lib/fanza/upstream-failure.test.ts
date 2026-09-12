/**
 * E6① の単体テスト（第124便 裁定5・push 前検証の必須項目）。
 *   API 失敗の各種別 → throw（→ 500） / 空結果 → empty（→ 404）。
 * ネットワークにも next/* にも触れない。実行: `npm test`
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  classifyUpstreamError,
  logUpstreamServed,
  resolveAcrossFloors,
} from "./upstream-failure.ts";

class FanzaApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FanzaApiError";
    this.status = status;
  }
}
class FanzaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FanzaConfigError";
  }
}
const abortError = () => {
  const e = new Error("The operation was aborted");
  e.name = "AbortError";
  return e;
};
const networkError = () => new TypeError("fetch failed");

const FLOORS = ["videoa", "anime", "nikkatsu"] as const;

// ---- API 失敗の各種別 → throw（→ 500） ----
const failures: [string, () => Error][] = [
  ["FanzaApiError 400", () => new FanzaApiError("FANZA API request failed: 400 Bad Request", 400)],
  ["FanzaApiError 500", () => new FanzaApiError("FANZA API request failed: 500", 500)],
  ["FanzaApiError 503", () => new FanzaApiError("FANZA API request failed: 503", 503)],
  ["FanzaConfigError", () => new FanzaConfigError("DMM_API_ID 未設定")],
  ["AbortError (timeout)", abortError],
  ["TypeError (network)", networkError],
  ["unknown Error", () => new Error("boom")],
];

for (const [label, make] of failures) {
  test(`全フロア失敗 (${label}) → throw（→ 500・404 にしない）`, async () => {
    const err = make();
    await assert.rejects(
      resolveAcrossFloors(FLOORS, async () => {
        throw err;
      }),
      (e: unknown) => e === err,
    );
  });
}

test("単一フロア失敗 (400) → throw", async () => {
  const err = new FanzaApiError("400", 400);
  await assert.rejects(
    resolveAcrossFloors(["videoa"], async () => {
      throw err;
    }),
    (e: unknown) => e === err,
  );
});

// ---- 正常応答・該当なし → empty（→ 404） ----
test("全フロア正常応答・該当なし → empty（→ 404）", async () => {
  const r = await resolveAcrossFloors(FLOORS, async () => null);
  assert.deepEqual(r, { kind: "empty", floors: [...FLOORS] });
});

test("単一フロア正常応答・該当なし → empty", async () => {
  const r = await resolveAcrossFloors(["videoa"], async () => null);
  assert.deepEqual(r, { kind: "empty", floors: ["videoa"] });
});

// ---- 見つかった → found ----
test("最初に見つかったフロアで止まる（後続フロアは呼ばない）", async () => {
  const called: string[] = [];
  const r = await resolveAcrossFloors(FLOORS, async (floor) => {
    called.push(floor);
    return floor === "anime" ? { id: "x" } : null;
  });
  assert.deepEqual(r, { kind: "found", floor: "anime", value: { id: "x" } });
  assert.deepEqual(called, ["videoa", "anime"]);
});

// ---- 混在: 失敗 + 該当なし → throw（不在と断定しない・条件 (a)） ----
test("1 フロア失敗 + 残りは該当なし → throw（404 にしない）", async () => {
  const err = new FanzaApiError("400", 400);
  await assert.rejects(
    resolveAcrossFloors(FLOORS, async (floor) => {
      if (floor === "videoa") throw err;
      return null;
    }),
    (e: unknown) => e === err,
  );
});

test("該当なし → 失敗 → 該当なし の順でも throw", async () => {
  const err = new TypeError("fetch failed");
  await assert.rejects(
    resolveAcrossFloors(FLOORS, async (floor) => {
      if (floor === "anime") throw err;
      return null;
    }),
    (e: unknown) => e === err,
  );
});

// ---- 混在: 失敗 + 後続で見つかった → found（失敗は致命ではない・従来どおり） ----
test("1 フロア失敗 + 後続フロアで見つかった → found", async () => {
  const r = await resolveAcrossFloors(FLOORS, async (floor) => {
    if (floor === "videoa") throw new FanzaApiError("400", 400);
    return floor === "nikkatsu" ? "hit" : null;
  });
  assert.deepEqual(r, { kind: "found", floor: "nikkatsu", value: "hit" });
});

// ---- 分類（ログ項目用・判定には使わない） ----
test("classifyUpstreamError: 種別と upstream_status", () => {
  assert.deepEqual(
    classifyUpstreamError(new FanzaApiError("x", 400)),
    { kind: "api", upstreamStatus: 400, name: "FanzaApiError", message: "x" },
  );
  assert.equal(classifyUpstreamError(new FanzaConfigError("c")).kind, "config");
  assert.equal(classifyUpstreamError(abortError()).kind, "timeout");
  assert.equal(classifyUpstreamError(networkError()).kind, "network");
  assert.equal(classifyUpstreamError(new Error("e")).kind, "unknown");
  assert.equal(classifyUpstreamError("str").kind, "unknown");
  assert.equal(classifyUpstreamError(null).upstreamStatus, null);
});

// ---- (c) GUARD ログに served=500 を含める・本番のみ ----
test("logUpstreamServed: production で GUARD タグ + served=500 を射出", () => {
  const lines: string[] = [];
  logUpstreamServed(
    "works/videoa/test",
    new FanzaApiError("FANZA API request failed: 400 Bad Request", 400),
    500,
    "production",
    (l) => lines.push(l),
  );
  assert.equal(lines.length, 1);
  const j = JSON.parse(lines[0]);
  assert.equal(j.tag, "VODNAVI_SILENT_DEATH_GUARD");
  assert.equal(j.served, 500);
  assert.equal(j.upstream_status, 400);
  assert.equal(j.upstream_kind, "api");
  assert.equal(j.context, "works/videoa/test");
});

test("logUpstreamServed: production 以外では何も出さない", () => {
  const lines: string[] = [];
  logUpstreamServed("ctx", new Error("e"), 500, "development", (l) => lines.push(l));
  logUpstreamServed("ctx", new Error("e"), 500, undefined, (l) => lines.push(l));
  assert.equal(lines.length, 0);
});
