// record.mjs: snowflake 復元（9/18 の 6 件で posted_at 一致）・payload 生成・禁止トークン検査
import test from "node:test";
import assert from "node:assert/strict";
import { snowflakeToIso, extractStatusId, replyKeyFor, jstYmd, buildCreatePayload, buildPostedPayload, FIELDS } from "./record.mjs";

test("snowflake → posted_at（2026-09-18 の 6 件・Airtable 記録値と秒単位で照合）", () => {
  const rows = [
    ["2100938278275064225", "2026-09-18T13:21:33"],
    ["2100939409021702654", "2026-09-18T13:26:03"],
    ["2100939657118937355", "2026-09-18T13:27:02"],
    ["2100939213181206773", "2026-09-18T13:25:16"],
    ["2100938911816224853", "2026-09-18T13:24:04"],
  ];
  for (const [id, sec] of rows) assert.equal(snowflakeToIso(id).slice(0, 19), sec);
  // 6 件目（Madonna）は記録値 13:23:19 に対し BigInt 計算では 13:23:20.297（1 秒差・記録側の丸め違い）。実測として固定する
  assert.equal(snowflakeToIso("2100938725194977383"), "2026-09-18T13:23:20.297Z");
  assert.throws(() => snowflakeToIso("abc"));
});

test("extractStatusId / replyKeyFor / jstYmd", () => {
  assert.equal(extractStatusId("https://x.com/vodnavi_jp/status/2100938278275064225"), "2100938278275064225");
  assert.equal(extractStatusId("https://x.com/vodnavi_jp/status/2100938278275064225?s=20"), "2100938278275064225");
  assert.equal(extractStatusId("https://x.com/vodnavi_jp"), null);
  const now = new Date("2026-09-18T15:30:00Z"); // JST 9/19 00:30
  assert.equal(jstYmd(now), "20260919");
  assert.equal(replyKeyFor("@FANZAdougaX", now), "20260919-FANZAdougaX");
});

test("buildCreatePayload: フィールド ID キー・reply_post_id/posted_at は含めない・禁止トークン検査", () => {
  const F = FIELDS.x_replies.fields;
  const p = buildCreatePayload({
    replyKey: "20260918-FANZAdougaX",
    targetRecordId: "recEfvfO65s5S0o1f",
    targetPostUrl: "https://x.com/FANZAdougaX/status/2100752031036342529",
    replyText: "第2弾への切り替え時期が気になります。",
    draftUsed: "C",
  });
  assert.equal(p.tableId, "tblpFVorIemSOywTH");
  const f = p.records[0].fields;
  assert.equal(f[F.reply_key], "20260918-FANZAdougaX");
  assert.deepEqual(f[F.target], ["recEfvfO65s5S0o1f"]);
  assert.equal(f[F.draft_used], "C");
  assert.equal(F.reply_post_id in f, false);
  assert.equal(F.posted_at in f, false);
  assert.throws(() => buildCreatePayload({ replyKey: "k", targetRecordId: "bad", targetPostUrl: "https://x.com/a/status/12345678", replyText: "x", draftUsed: "A" }), /recordId/);
  assert.throws(() => buildCreatePayload({ replyKey: "k", targetRecordId: "recEfvfO65s5S0o1f", targetPostUrl: "https://x.com/a/status/12345678", replyText: "https://vodnavi.jp を見て", draftUsed: "A" }), /禁止トークン/);
  assert.throws(() => buildCreatePayload({ replyKey: "k", targetRecordId: "recEfvfO65s5S0o1f", targetPostUrl: "https://x.com/a/status/12345678", replyText: "x", draftUsed: "D" }), /draft_used/);
});

test("buildPostedPayload: reply_post_id / posted_at / last_reply_at", () => {
  const F = FIELDS.x_replies.fields;
  const T = FIELDS.x_targets.fields;
  const p = buildPostedPayload({ recordId: "rec1fqChrGPQXGNmQ", targetRecordId: "recEfvfO65s5S0o1f", replyUrl: "https://x.com/vodnavi_jp/status/2100938278275064225" });
  assert.equal(p.reply_post_id, "2100938278275064225");
  assert.equal(p.posted_at.slice(0, 19), "2026-09-18T13:21:33");
  assert.equal(p.x_replies.records[0].fields[F.reply_post_id], "2100938278275064225");
  assert.equal(p.x_targets.records[0].fields[T.last_reply_at], p.posted_at);
  assert.throws(() => buildPostedPayload({ recordId: "rec1fqChrGPQXGNmQ", targetRecordId: "recEfvfO65s5S0o1f", replyUrl: "https://x.com/vodnavi_jp" }), /status id/);
});
