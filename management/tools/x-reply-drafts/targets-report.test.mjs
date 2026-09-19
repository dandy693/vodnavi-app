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

test("aggregate --reactions: 取得済み件数・likes/replies/views を reactions.json から数え、無い行は未取得", () => {
  const reactions = {
    by_reply_post_id: {
      "1": { likes: 0, replies: 0, reposts: 0, views: 7, fetched: true },
      "2": { likes: 2, replies: 1, reposts: 0, views: 35, fetched: true },
      // "3" は未取得（reactions に無い）
    },
  };
  const agg = aggregate({ replies: REPLIES, targets: TARGETS, reactions, since: "2026-09-18", until: "2026-09-24" });
  assert.equal(agg.reactions_source, "reactions.json");
  assert.equal(agg.total.count, 4);
  assert.equal(agg.total.reactions_fetched, 2, "4 件中 2 件のみ取得済み");
  assert.equal(agg.total.likes_sum, 2);
  assert.equal(agg.total.replies_sum, 1);
  assert.equal(agg.total.views_sum, 42);
  assert.equal(agg.total.views_median, 21);
  assert.equal(agg.by_type["女優本人"].reactions_fetched, 0, "r3 は未取得");
  assert.equal(agg.by_type["女優本人"].views_median, null);
  const md = toMarkdown(agg);
  assert.ok(md.includes("反応 取得済"));
  assert.ok(md.includes("| **合計** | 4 | A 2 / B 1 / C 1 | 1 | 1 | 1 | 2（未取得 2） | 2 / 1 | 42（中央値 21） |"), md);
  // reactions 無しなら列も出ない
  const md0 = toMarkdown(aggregate({ replies: REPLIES, targets: TARGETS }));
  assert.ok(!md0.includes("反応 取得済"));
});

test("own-posts: X Analytics CSV（旧形式 +0000）を tolerant に読み、リプ自身を除外し、期間内の中央値を出す（観測のみ）", async () => {
  const { parseCsv, parseTimeJst, normalizeOwnPosts, ownPostsStats } = await import("./weekly-report.mjs");
  // 旧 Twitter Analytics 形式（UTC・+0000）。2 行目は本文に改行とカンマを含む
  const csv = '\uFEFF"Tweet id","Tweet permalink","Tweet text","time","impressions","engagements"\n' +
    '"9001","https://x.com/vodnavi_jp/status/9001","本文, カンマ\n改行あり","2026-09-18 12:00 +0000","120","3"\n' +
    '"9002","https://x.com/vodnavi_jp/status/9002","本文2","2026-09-19 12:00 +0000","40","1"\n' +
    '"1","https://x.com/vodnavi_jp/status/1","リプ自身","2026-09-18 13:21 +0000","7","0"\n' +
    '"9003","https://x.com/vodnavi_jp/status/9003","期間外","2026-09-25 12:00 +0000","999","9"\n' +
    '"9004","https://x.com/vodnavi_jp/status/9004","imp 空","2026-09-19 13:00 +0000","",""\n';
  assert.equal(parseCsv(csv).length, 6);
  assert.equal(parseTimeJst("2026-09-18 12:00 +0000").toISOString(), "2026-09-18T12:00:00.000Z");
  assert.equal(parseTimeJst("2026-09-18 21:00").toISOString(), "2026-09-18T12:00:00.000Z", "TZ 無しは JST");
  assert.equal(parseTimeJst("2026/9/18 21:00").toISOString(), "2026-09-18T12:00:00.000Z");
  assert.equal(parseTimeJst("no date"), null);
  const norm = normalizeOwnPosts(csv);
  assert.deepEqual(norm.columns, { id: "Tweet id", time: "time", impressions: "impressions" });
  const st = ownPostsStats(norm, { since: "2026-09-18", until: "2026-09-24", excludeIds: new Set(["1"]) });
  assert.equal(st.excluded_replies, 1);
  assert.equal(st.n, 2, "9001 / 9002（期間外 9003・imp 空 9004 は除く）");
  assert.equal(st.no_impressions, 1);
  assert.equal(st.impressions_median, 80);
  assert.equal(st.impressions_sum, 160);
  // aggregate に通すと比較表が出る（判定は書かない）
  const agg = aggregate({ replies: REPLIES, targets: TARGETS, ownPosts: csv, since: "2026-09-18", until: "2026-09-24" });
  assert.equal(agg.own_posts.n, 2);
  assert.equal(agg.own_posts.excluded_replies, 1, "REPLIES の reply_post_id=1 が除外される");
  const md = toMarkdown(agg);
  assert.ok(md.includes("| 自投稿のインプレッション（X Analytics CSV・HUMAN 提供・リプ自身 1 件を除外） | 2 | 80 | 160 |"), md);
  assert.ok(md.includes("観測のみ"));
  assert.ok(!/推奨|判定:/.test(md));
});

test("own-posts: 新形式（Post id / Date・TZ 無し＝JST）と JSON 形式", async () => {
  const { normalizeOwnPosts, ownPostsStats } = await import("./weekly-report.mjs");
  const csv = "Date,Post id,Post text,Impressions,Likes\r\n2026-09-18 21:00,9001,本文,\"1,234\",2\r\n2026-09-19 22:30,9002,本文2,50,0\r\n";
  const norm = normalizeOwnPosts(csv);
  assert.deepEqual(norm.columns, { id: "Post id", time: "Date", impressions: "Impressions" });
  assert.equal(norm.posts[0].impressions, 1234, "桁区切りカンマを除去");
  const st = ownPostsStats(norm, { since: "2026-09-19", until: "2026-09-19" });
  assert.equal(st.n, 1);
  assert.equal(st.impressions_median, 50);
  const j = ownPostsStats(normalizeOwnPosts([{ id: 9001, time: "2026-09-18T21:00:00+09:00", impressions: 10 }, { id: 9002, time: "2026-09-18T22:00:00+09:00", impressions: 30 }]), {});
  assert.equal(j.n, 2);
  assert.equal(j.impressions_median, 20);
});
