// active-targets.mjs / weekly-report.mjs のテスト（純関数・ネットワークなし）
import test from "node:test";
import assert from "node:assert/strict";
import { activeTargets, summarize } from "./active-targets.mjs";
import { aggregate, toMarkdown, normalizeRepliesFull } from "./weekly-report.mjs";

const TARGETS = {
  records: [
    { id: "recA", fields: { handle: "@a_maker", type: "メーカー公式", priority: 1, status: "稼働", reply_restriction: "なし", no_repropose: false } },
    { id: "recB", fields: { handle: "@b_actress", type: "女優本人", priority: 2, status: "稼働", reply_restriction: "なし", no_repropose: false } },
    { id: "recC", fields: { handle: "@c_contrast", type: "メーカー公式", priority: 3, status: "稼働", reply_restriction: "なし", no_repropose: false } },
    { id: "recD", fields: { handle: "@d_restricted", type: "メーカー公式", priority: 1, status: "稼働", reply_restriction: "あり", no_repropose: false } },
    { id: "recE", fields: { handle: "@e_norepropose", type: "女優本人", priority: 2, status: "候補", reply_restriction: "不明", no_repropose: true } },
    { id: "recF", fields: { handle: "@f_candidate", type: "レビュー系", priority: 1, status: "候補", reply_restriction: "不明", no_repropose: false } },
    { id: "recG", fields: { handle: "@g_nopriority", type: "セール告知系", status: "稼働", reply_restriction: "なし", no_repropose: false } },
  ],
};

test("activeTargets: 稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり を priority 昇順（空は末尾）→ handle 順で返す", () => {
  const list = activeTargets(TARGETS);
  assert.deepEqual(list.map((t) => t.handle), ["a_maker", "b_actress", "c_contrast", "g_nopriority"]);
  assert.equal(list.find((t) => t.handle === "c_contrast").contrast, true, "priority 3 は対照");
  assert.equal(list.find((t) => t.handle === "a_maker").contrast, false);
  const s = summarize(list);
  assert.equal(s.count, 4);
  assert.deepEqual(s.by_priority, { 1: 1, 2: 1, 3: 1, "空": 1 });
  assert.deepEqual(s.contrast, ["c_contrast"]);
});

const REPLIES = {
  records: [
    // MCP 生出力の形（cellValuesByFieldId）
    { id: "r1", cellValuesByFieldId: { fld63cUuOti14Vlnj: "20260918-a_maker", fldPt0Ob7S3llquKB: [{ id: "recA", name: "@a_maker" }], fldACpFxznVDTtmWu: "2026-09-18T13:21:33.000Z", fldeXo1Hzlb5xytfv: { name: "C" }, fldvTCPxXU4ydY7O7: true, fld3EPVhYRfBuvEZL: "1" } },
    { id: "r2", cellValuesByFieldId: { fld63cUuOti14Vlnj: "20260919-a_maker", fldPt0Ob7S3llquKB: [{ id: "recA", name: "@a_maker" }], fldACpFxznVDTtmWu: "2026-09-19T03:30:22.865Z", fldeXo1Hzlb5xytfv: { name: "A" }, fldm3bUI9JpPqGH4u: true, fldFlFQpFuxNigy2Z: 2, fld3EPVhYRfBuvEZL: "2" } },
    // fields 形
    { id: "r3", fields: { reply_key: "20260919-b_actress", target: [{ id: "recB", name: "@b_actress" }], posted_at: "2026-09-19T03:31:09.852Z", draft_used: "A", reply_post_id: "3" } },
    // 期間外（9/17）
    { id: "r4", fields: { reply_key: "20260917-c_contrast", target: ["recC"], posted_at: "2026-09-17T12:00:00.000Z", draft_used: "B", reply_post_id: "4" } },
    // reply_post_id 空・posted_at 空（記入状況に出す）
    { id: "r5", fields: { reply_key: "20260919-zz", target: [{ id: "recZ", name: "@zz_unknown" }], draft_used: "B" } },
  ],
};

test("normalizeRepliesFull: 生出力と fields 形の両方を読む", () => {
  const rows = normalizeRepliesFull(REPLIES);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].got_like, true);
  assert.equal(rows[0].got_reply, false);
  assert.equal(rows[1].profile_click_delta, 2);
  assert.equal(rows[2].target_id, "recB");
  assert.equal(rows[3].target_id, "recC");
});

test("aggregate: priority 別・type 別・件数・draft_used・got_like/got_reply・期間絞り", () => {
  const agg = aggregate({ replies: REPLIES, targets: TARGETS, since: "2026-09-18", until: "2026-09-24" });
  assert.equal(agg.total.count, 4, "9/17 の 1 件は期間外・posted_at 空の 1 件は落とさない");
  assert.deepEqual(agg.total.draft_used, { A: 2, B: 1, C: 1, "空": 0 });
  assert.equal(agg.total.got_like, 1);
  assert.equal(agg.total.got_reply, 1);
  assert.equal(agg.total.profile_click_delta_filled, 1);
  assert.equal(agg.total.no_post_id, 1);
  assert.equal(agg.by_priority["1"].count, 2);
  assert.equal(agg.by_priority["2"].count, 1);
  assert.equal(agg.by_priority["空"].count, 1, "x_targets に紐づかない行は priority 空");
  assert.equal(agg.by_type["メーカー公式"].count, 2);
  assert.equal(agg.by_type["女優本人"].count, 1);
  assert.equal(agg.by_type["不明"].count, 1);
  assert.equal(agg.by_priority_type["1｜メーカー公式"].count, 2);
  assert.deepEqual(agg.unmatched, ["20260919-zz"]);
  const md = toMarkdown(agg);
  assert.ok(md.includes("| **合計** | 4 |"));
  assert.ok(md.includes("| priority 1 | 2 |"));
  assert.ok(md.includes("x_targets に紐づかない行: 20260919-zz"));
});

test("aggregate: 期間なしなら全件", () => {
  const agg = aggregate({ replies: REPLIES, targets: TARGETS });
  assert.equal(agg.total.count, 5);
  assert.equal(agg.by_priority["3"].count, 1);
});
