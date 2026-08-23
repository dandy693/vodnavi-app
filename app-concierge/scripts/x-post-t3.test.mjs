/**
 * T3（セール速報）の生成とガードのテスト（第98便 タスクA）。
 *
 * 【方針】`sale.test.ts` と同じく **node:test / 依存追加なし**。
 * 検査対象は**純関数のみ**（`buildT3` と `GUARDS` の各関数）。
 * `g17`（リンク先の実在）はネットワークを触るため**ここでは検査しない**——
 * `checkLinkReachable` は `fetchImpl` を差し替えられる設計なので、
 * 実測が必要なときは呼び出し側で行う。
 *
 * 【厳守】本テストは**自動投稿が動くことを保証しない。**
 * 保証するのは「ガードが意図どおり拒否する」ことだけである。
 * **稼働の可否は CSO の最終裁定事項**であり、テストの合否とは無関係。
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GUARDS,
  T3_SALE_URL,
  buildT3,
  runGuards,
  t3HoursLeft,
  t3JstDate,
  t3JstLabel,
} from "./x-post-generator.mjs";

/** 第96便補遺で実捕捉した材料（`VODNAVI_NEW_CAMPAIGN` の原文をそのまま使う）。 */
const DAILY = {
  campaign_title: "日替わりセール★",
  items: 1,
  ends_at: "2026-08-23T14:59:59+00:00", // = 8/23 23:59:59 JST（当日終了）
  max_discount: 30,
  samples: [{ content_id: "ipzz00562", floor_code: "videoa", price: 210, list_price: 300 }],
};

/** 翌日以降に終わる材料（§5-4 の 50%OFF と同じ形）。 */
const MULTI = {
  campaign_title: "50％OFFキャンペーン",
  items: 462,
  ends_at: "2026-08-24T00:59:59+00:00", // = 8/24 09:59:59 JST（翌日）
  max_discount: 50,
  samples: [{ content_id: "125umd00960", floor_code: "videoa", price: 150, list_price: 300 }],
};

/** 2026-08-23 22:30 JST = 13:30 UTC。g8 の枠（21:00〜23:00）内。 */
const SCHED = "2026-08-23T13:30:00.000Z";

function post(material, scheduledUtc = SCHED, over = {}) {
  const built = buildT3(material, scheduledUtc);
  return {
    ...built,
    scheduledUtc,
    intendedJst: "2026-08-23 22:30",
    name: `T3 ${material.campaign_title}`,
    ...over,
  };
}

// ---------------------------------------------------------------------------
// 時刻ヘルパ
// ---------------------------------------------------------------------------

test("t3JstLabel: UTC を JST の M/D HH:mm へ", () => {
  assert.equal(t3JstLabel("2026-08-24T00:59:59+00:00"), "8/24 09:59");
  assert.equal(t3JstLabel("2026-08-23T14:59:59+00:00"), "8/23 23:59");
  assert.equal(t3JstLabel("こわれた値"), null);
});

test("t3JstDate: JST の日付境界で切る", () => {
  assert.equal(t3JstDate("2026-08-23T14:59:59+00:00"), "2026-08-23", "JST 23:59 は当日");
  assert.equal(t3JstDate("2026-08-23T15:00:00+00:00"), "2026-08-24", "JST 00:00 は翌日");
});

test("t3HoursLeft: 生成時刻ではなく配信時刻を基準にする", () => {
  // 22:30 JST 配信 → 23:59:59 JST 終了 なら残り約1時間
  assert.equal(t3HoursLeft(DAILY.ends_at, SCHED), 1);
  // 同じ材料でも 14:00 JST 時点なら残り9時間＝基準が違えば値も違う
  assert.equal(t3HoursLeft(DAILY.ends_at, "2026-08-23T05:00:00.000Z"), 9);
});

// ---------------------------------------------------------------------------
// buildT3 — 数値固定テンプレート
// ---------------------------------------------------------------------------

test("buildT3: 当日終了なら残り時間を本文に入れる", () => {
  const p = buildT3(DAILY, SCHED);
  assert.match(p.text, /残り約1時間/);
  assert.match(p.text, /日替わりセール★/);
  assert.match(p.text, /最大30%OFF/);
  assert.match(p.text, /8\/23 23:59まで/);
  assert.match(p.text, /確認できた範囲で1件/);
  assert.match(p.text, /ipzz00562/);
  assert.match(p.text, /#PR/);
  assert.equal(p.linkUrl, T3_SALE_URL);
  assert.equal(p.kind, "T3");
});

test("buildT3: 翌日以降の期限では残り時間を書かない", () => {
  const p = buildT3(MULTI, SCHED);
  assert.doesNotMatch(p.text, /残り約/);
  assert.match(p.text, /8\/24 09:59まで/);
});

test("buildT3: 本文に URL を埋め込まない（g13 の要件）", () => {
  assert.doesNotMatch(buildT3(MULTI, SCHED).text, /https?:\/\//);
});

test("buildT3: 材料が欠けたら null（推測で埋めない）", () => {
  assert.equal(buildT3(null, SCHED), null);
  assert.equal(buildT3({ campaign_title: "x", items: 1 }, SCHED), null, "ends_at が無い");
  assert.equal(buildT3({ campaign_title: "x", ends_at: MULTI.ends_at }, SCHED), null, "items が無い");
});

// ---------------------------------------------------------------------------
// g14 — リンク先（第94便で判明した素通りの修正）
// ---------------------------------------------------------------------------

test("g14: T3 のリンク先が /sale なら通る", () => {
  assert.equal(GUARDS.g14_link_target_by_kind(post(MULTI)).ok, true);
});

test("g14: T3 のリンク先が /sale 以外なら拒否する", () => {
  for (const bad of [
    "https://app.vodnavi.jp/works/videoa/abc00001",
    "https://app.vodnavi.jp/lp",
    "https://al.dmm.co.jp/?lurl=x&af_id=moterist-006",
    "https://example.com/sale",
  ]) {
    const r = GUARDS.g14_link_target_by_kind(post(MULTI, SCHED, { linkUrl: bad }));
    assert.equal(r.ok, false, `通ってはいけない: ${bad}`);
  }
});

test("g14: T3 は UTM 付きの /sale を許容する（origin+pathname で判定）", () => {
  const r = GUARDS.g14_link_target_by_kind(
    post(MULTI, SCHED, { linkUrl: `${T3_SALE_URL}?utm_source=x_vodnavi&utm_medium=social` }),
  );
  assert.equal(r.ok, true);
});

test("g14: 【回帰】第94便で素通りしていたことを再現できる", () => {
  // kind を外すと（＝T3 と名乗らないと）従来どおり素通りする。
  const r = GUARDS.g14_link_target_by_kind(post(MULTI, SCHED, { kind: undefined, linkUrl: "https://example.com/x" }));
  assert.equal(r.ok, true, "kind が無ければ g14 は判定しない（既存の契約）");
});

// ---------------------------------------------------------------------------
// g18 — 1日1件上限
// ---------------------------------------------------------------------------

test("g18: 同日に T3 が2件あれば拒否する", () => {
  const a = post(MULTI);
  const b = post(DAILY, "2026-08-23T12:00:00.000Z");
  const res = runGuards([a, b]);
  const hit = res.failures.filter((f) => f.guard === "g18_t3_one_per_day");
  assert.ok(hit.length > 0, "2件目が検出されること");
});

test("g18: 同日1件なら通る", () => {
  const res = runGuards([post(MULTI)]);
  assert.equal(res.failures.filter((f) => f.guard === "g18_t3_one_per_day").length, 0);
});

test("g18: 既存行の /sale 投稿も件数に数える（kind を持たない既存行）", () => {
  const existing = [{ linkUrl: T3_SALE_URL, scheduledUtc: "2026-08-23T12:00:00.000Z" }];
  const res = runGuards([post(MULTI)], existing);
  assert.ok(res.failures.some((f) => f.guard === "g18_t3_one_per_day"));
});

// ---------------------------------------------------------------------------
// g19 — 期限
// ---------------------------------------------------------------------------

test("g19: 配信時点で期限切れなら拒否する", () => {
  // 8/23 23:59:59 JST 終了の材料を、翌日 22:30 JST に配信しようとする
  const p = post(DAILY, "2026-08-24T13:30:00.000Z");
  const r = GUARDS.g19_t3_deadline(p);
  assert.equal(r.ok, false);
  assert.match(r.ng, /期限切れ/);
});

test("g19: 当日期限で残り時間の明記が無ければ拒否する", () => {
  const p = post(DAILY, SCHED, { text: "FANZAで「日替わりセール★」を確認しました。\n#PR" });
  const r = GUARDS.g19_t3_deadline(p);
  assert.equal(r.ok, false);
  assert.match(r.ng, /残り時間/);
});

test("g19: 当日期限でも残り時間があれば通る", () => {
  assert.equal(GUARDS.g19_t3_deadline(post(DAILY)).ok, true);
});

test("g19: 翌日以降の期限は残り時間の明記を要さない", () => {
  assert.equal(GUARDS.g19_t3_deadline(post(MULTI)).ok, true);
});

test("g19: material が無ければ拒否する（期限を検証できない）", () => {
  const p = post(MULTI, SCHED, { material: undefined });
  assert.equal(GUARDS.g19_t3_deadline(p).ok, false);
});

// ---------------------------------------------------------------------------
// g20 — 数値固定テンプレート
// ---------------------------------------------------------------------------

test("g20: 生成そのままなら通る", () => {
  assert.equal(GUARDS.g20_t3_template(post(MULTI)).ok, true);
  assert.equal(GUARDS.g20_t3_template(post(DAILY)).ok, true);
});

test("g20: #PR が無ければ拒否する", () => {
  const p = post(MULTI);
  p.text = p.text.replace("#PR", "");
  assert.match(GUARDS.g20_t3_template(p).ng, /#PR/);
});

test("g20: 形容・評価・推奨の語を拒否する", () => {
  for (const w of ["お得", "今すぐ", "必見", "人気", "絶対", "最安"]) {
    const p = post(MULTI);
    p.text = `${p.text}\n${w}`;
    const r = GUARDS.g20_t3_template(p);
    assert.equal(r.ok, false, `拒否されるべき語: ${w}`);
    assert.match(r.ng, /形容・評価・推奨/);
  }
});

test("g20: 【中核】material から説明できない数値を拒否する", () => {
  const p = post(MULTI);
  p.text = `${p.text}\n過去最大の1200件規模`;
  const r = GUARDS.g20_t3_template(p);
  assert.equal(r.ok, false);
  assert.match(r.ng, /説明できない数値/);
  assert.match(r.ng, /1200/);
});

test("g20: 件数の但し書きが消えたら拒否する（総数と誤読されるため）", () => {
  const p = post(MULTI);
  p.text = p.text.replace("確認できた範囲で", "");
  assert.match(GUARDS.g20_t3_template(p).ng, /但し書き/);
});

test("g20: キャンペーン名が本文に無ければ拒否する", () => {
  const p = post(MULTI);
  p.text = p.text.replace(MULTI.campaign_title, "別のセール");
  assert.match(GUARDS.g20_t3_template(p).ng, /キャンペーン名/);
});

// ---------------------------------------------------------------------------
// g21 — 再報告の重複除外
// ---------------------------------------------------------------------------

test("g21: 既存行に同名があれば拒否する（06:00 と 14:00 の二重報告に対応）", () => {
  const existing = [{ material: { campaign_title: "50％OFFキャンペーン" }, scheduledUtc: "2026-08-22T13:30:00.000Z" }];
  const res = runGuards([post(MULTI)], existing);
  assert.ok(res.failures.some((f) => f.guard === "g21_t3_not_reported"));
});

test("g21: campaignTitle 列だけを持つ既存行でも拒否する", () => {
  const existing = [{ campaignTitle: "50％OFFキャンペーン", scheduledUtc: "2026-08-22T13:30:00.000Z" }];
  const res = runGuards([post(MULTI)], existing);
  assert.ok(res.failures.some((f) => f.guard === "g21_t3_not_reported"));
});

test("g21: 名称が違えば通る", () => {
  const existing = [{ material: { campaign_title: "別のセール" }, scheduledUtc: "2026-08-22T13:30:00.000Z" }];
  const res = runGuards([post(MULTI)], existing);
  assert.equal(res.failures.filter((f) => f.guard === "g21_t3_not_reported").length, 0);
});

test("g21: 同一バッチ内の自分自身を既報告と誤判定しない", () => {
  const res = runGuards([post(MULTI)]);
  assert.equal(res.failures.filter((f) => f.guard === "g21_t3_not_reported").length, 0);
});

// ---------------------------------------------------------------------------
// 既存ガードとの整合（T3 が既存の枠を壊さないこと）
// ---------------------------------------------------------------------------

test("T3 は既存18ガードを一つも落とさずに通る（g17 を除く同期20件）", () => {
  const res = runGuards([post(MULTI)]);
  assert.deepEqual(res.failures, [], JSON.stringify(res.failures));
  assert.equal(res.pass, true);
});

test("T3 は g5（%OFF 禁止）の対象外である＝割引率を書ける", () => {
  const p = post(MULTI);
  assert.match(p.text, /50%OFF/);
  assert.equal(GUARDS.g5_no_discount_amount(p).ok, true, "g5 は T1 のみに適用される");
});

test("T3 は作品紹介枠（g11）もアフィリエイト枠（g6）も消費しない", () => {
  // 同日に T1改 と 006直リンクがあっても T3 が原因で落ちないこと
  const existing = [
    { linkUrl: "https://app.vodnavi.jp/works/videoa/abc00001", scheduledUtc: "2026-08-23T12:00:00.000Z" },
    { linkUrl: "https://al.dmm.co.jp/?lurl=x&af_id=moterist-006", scheduledUtc: "2026-08-23T12:15:00.000Z" },
  ];
  const res = runGuards([post(MULTI)], existing);
  assert.equal(res.failures.filter((f) => f.guard === "g11_one_work_intro_per_day").length, 0);
  assert.equal(res.failures.filter((f) => f.guard === "g6_one_affiliate_per_day").length, 0);
});

test("T3 が枠外の時刻なら g8 が拒否する（既存ガードが T3 にも効く）", () => {
  const p = post(MULTI, "2026-08-23T02:00:00.000Z"); // 11:00 JST
  assert.equal(GUARDS.g8_time_window(p).ok, false);
});
