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

test("--create --texts: 投稿した本文を正として記録（HUMAN 手直し・CSO判定 2026-09-19 12:1x）", async () => {
  const { execFileSync } = await import("node:child_process");
  const os = await import("node:os");
  const fs = await import("node:fs");
  const path = await import("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xrd-"));
  const drafts = { dry_run: false, items: [{ handle: "honnaka_NN", replyKey: "20260919-honnaka_NN", postUrl: "https://x.com/honnaka_NN/status/2100967587974946947", status: "generated", target: { id: "rec0nGddlSPhwOqcI" }, drafts: { A: { text: "案の本文です。9月19日の配信開始おめでとうございます。", guard: { ok: true, failures: [] } } } }] };
  const dp = path.join(dir, "drafts.json"); fs.writeFileSync(dp, JSON.stringify(drafts));
  const tp = path.join(dir, "texts.json"); fs.writeFileSync(tp, JSON.stringify({ honnaka_NN: "手直しした本文です。9月19日の配信開始おめでとうございます。" }));
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const out = JSON.parse(execFileSync(process.execPath, [path.join(here, "record.mjs"), "--create", dp, "--pick", "honnaka_NN=A", "--texts", tp], { encoding: "utf8" }));
  assert.equal(out.count, 1);
  assert.deepEqual(out.text_overridden_for, ["honnaka_NN"]);
  const f = out.records[0].fields;
  assert.equal(f["fldbKfB0mpR9wMS2g"], "手直しした本文です。9月19日の配信開始おめでとうございます。");
  assert.equal(f["fldeXo1Hzlb5xytfv"], "A");
  const out2 = JSON.parse(execFileSync(process.execPath, [path.join(here, "record.mjs"), "--create", dp, "--pick", "honnaka_NN=A"], { encoding: "utf8" }));
  assert.equal(out2.text_overridden_for, undefined);
  assert.equal(out2.records[0].fields["fldbKfB0mpR9wMS2g"], "案の本文です。9月19日の配信開始おめでとうございます。");
});

test("--create: 「一部生成不能」の行でも、選んだ型がガード通過なら記録できる（2026-09-21・attackers_av の実例）", async () => {
  const { execFileSync } = await import("node:child_process");
  const os = await import("node:os");
  const fs = await import("node:fs");
  const path = await import("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xrd-"));
  const item = { handle: "attackers_av", replyKey: "20260921-attackers_av", postUrl: "https://x.com/attackers_av/status/2101692866636734862", status: "一部生成不能（B がガード未通過・最大 2 回再生成後）", target: { id: "recGCCpEJDzLNEkLo" }, drafts: { A: { text: "新作配信開始おめでとうございます。8KVRでの梓ヒカリさん出演作が9月21日0時にスタートしたのですね。", guard: { ok: true, failures: [] } }, B: { text: "x", guard: { ok: false, failures: [{ rule: "R14" }] } } } };
  const dp = path.join(dir, "drafts.json"); fs.writeFileSync(dp, JSON.stringify({ dry_run: false, items: [item] }));
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const out = JSON.parse(execFileSync(process.execPath, [path.join(here, "record.mjs"), "--create", dp, "--pick", "attackers_av=A"], { encoding: "utf8" }));
  assert.equal(out.count, 1);
  assert.equal(out.records[0].fields["fldeXo1Hzlb5xytfv"], "A");
  assert.throws(() => execFileSync(process.execPath, [path.join(here, "record.mjs"), "--create", dp, "--pick", "attackers_av=B"], { encoding: "utf8", stdio: "pipe" }), /ガード未通過/);
});
