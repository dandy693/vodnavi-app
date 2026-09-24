// follow-candidates.mjs の純関数テスト（X・Airtable・ネットワークには触れない）
import test from "node:test";
import assert from "node:assert/strict";
import {
  parseCandidateLines,
  selectCandidates,
  targetHandles,
  mergeFollows,
  estimateFollowing,
  FOLLOWING_BASELINE,
  LIMITS,
} from "./follow-candidates.mjs";

const TAB = String.fromCharCode(9);

test("parseCandidateLines: TAB / ｜ / | のいずれでもハンドルと根拠に割れる", () => {
  const text = [
    "@userA" + TAB + "20260924-FANZAdougaX の投稿にいいね",
    "@userB｜20260924-MOODYZ_official の投稿に返信",
    "@userC|20260924-FANZAdougaX の投稿にいいね",
  ].join("\n");
  const { items, errors } = parseCandidateLines(text);
  assert.equal(errors.length, 0);
  assert.deepEqual(items.map((x) => x.handle), ["userA", "userB", "userC"]);
  assert.match(items[1].reason, /返信/);
});

test("parseCandidateLines: 空行・コメント行は無視し、根拠なし／不正ハンドルは errors へ", () => {
  const text = ["", "# メモ", "@ok" + TAB + "根拠あり", "@noreason", "@不正な名前" + TAB + "根拠"].join("\n");
  const { items, errors } = parseCandidateLines(text);
  assert.deepEqual(items.map((x) => x.handle), ["ok"]);
  assert.equal(errors.length, 2);
  assert.match(errors[0].reason, /根拠が空/);
  assert.match(errors[1].reason, /ハンドルの形式/);
});

test("selectCandidates: 自アカウント・x_targets・follows 既存・バッチ内重複を除く", () => {
  const items = [
    { handle: "vodnavi_jp", reason: "自分" },
    { handle: "FANZAdougaX", reason: "対象アカウント" },
    { handle: "already", reason: "既フォロー" },
    { handle: "newuser", reason: "20260924-X にいいね" },
    { handle: "newuser", reason: "重複" },
  ];
  const res = selectCandidates(items, {
    targets: new Set(["FANZAdougaX"]),
    follows: [{ date: "2026-09-23", handle: "already", reason: "…" }],
    max: 10,
    date: "2026-09-24",
  });
  assert.deepEqual(res.picked.map((x) => x.handle), ["newuser"]);
  assert.equal(res.skipped.length, 4);
  assert.match(res.skipped.find((s) => s.handle === "vodnavi_jp").why, /自アカウント/);
  assert.match(res.skipped.find((s) => s.handle === "FANZAdougaX").why, /x_targets/);
  assert.match(res.skipped.find((s) => s.handle === "already").why, /follows/);
});

test("selectCandidates: 当日の記録済み件数を差し引いて残り枠だけ採る", () => {
  const items = Array.from({ length: 5 }, (_, i) => ({ handle: "u" + i, reason: "r" }));
  const follows = Array.from({ length: 8 }, (_, i) => ({ date: "2026-09-24", handle: "old" + i, reason: "r" }));
  const res = selectCandidates(items, { follows, max: 10, date: "2026-09-24" });
  assert.equal(res.todayCount, 8);
  assert.equal(res.remaining, 2);
  assert.equal(res.picked.length, 2);
  assert.equal(res.skipped.filter((s) => /上限/.test(s.why)).length, 3);
});

test("selectCandidates: 別日の記録は当日の枠を消費しない", () => {
  const items = [{ handle: "u1", reason: "r" }];
  const follows = Array.from({ length: 10 }, (_, i) => ({ date: "2026-09-23", handle: "old" + i, reason: "r" }));
  const res = selectCandidates(items, { follows, max: 10, date: "2026-09-24" });
  assert.equal(res.todayCount, 0);
  assert.equal(res.picked.length, 1);
});

test("targetHandles: 生出力（cellValuesByFieldId）と fields 形の両方から handle を拾う", () => {
  const j = {
    records: [
      { cellValuesByFieldId: { fldaWVD2Hs0AeWURb: "FANZAdougaX" } },
      { fields: { handle: "@MOODYZ_official" } },
      { cellValuesByFieldId: {} },
    ],
  };
  const set = targetHandles(j);
  assert.ok(set.has("FANZAdougaX"));
  assert.ok(set.has("MOODYZ_official"));
  assert.equal(set.size, 2);
});

test("mergeFollows: 重複は弾き、日付とハンドルと根拠を残す", () => {
  const follows = { baseline: FOLLOWING_BASELINE, limits: LIMITS, entries: [{ date: "2026-09-23", handle: "a", reason: "r0" }] };
  const res = mergeFollows(follows, "2026-09-24", [
    { handle: "a", reason: "重複" },
    { handle: "b", reason: "r1" },
  ]);
  assert.equal(res.added.length, 1);
  assert.deepEqual(res.added[0], { date: "2026-09-24", handle: "b", reason: "r1" });
  assert.equal(res.dup.length, 1);
  assert.equal(res.follows.entries.length, 2);
});

test("estimateFollowing: 起点 156 ＋ 累計で推定し、300 で停止判定が立つ", () => {
  const mk = (n) => ({ baseline: FOLLOWING_BASELINE, limits: LIMITS, entries: Array.from({ length: n }, (_, i) => ({ date: "d", handle: "h" + i, reason: "r" })) });
  const a = estimateFollowing(mk(0));
  assert.equal(a.baseline, 156);
  assert.equal(a.estimated, 156);
  assert.equal(a.remainingToStop, 144);
  assert.equal(a.reached, false);
  const b = estimateFollowing(mk(144));
  assert.equal(b.estimated, 300);
  assert.equal(b.reached, true);
});

test("起点の値は HUMAN 実測 2026-09-24（フォロワー 13 / フォロー中 156）", () => {
  assert.deepEqual(FOLLOWING_BASELINE, { date: "2026-09-24", following: 156, followers: 13 });
  assert.equal(LIMITS.perDay, 10);
  assert.equal(LIMITS.followingStop, 300);
});
