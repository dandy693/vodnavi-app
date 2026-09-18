// generate.mjs: 停止判定（裁定 G・dedupe・対象外）と生成ループ（stub・ネットワークなし・裁定 H）
import test from "node:test";
import assert from "node:assert/strict";
import { checkStop, generateForLine, normalizeTargets, normalizeReplies, jstDayDiff, loadSystemPrompt, stubGenerator } from "./generate.mjs";
import { parseLine } from "./parse.mjs";

const NOW = new Date("2026-09-21T03:00:00Z"); // JST 9/21 12:00
const line = parseLine("@FANZAdougaX｜2026-09-21 10:00｜https://x.com/FANZAdougaX/status/2100752031036342529｜第2弾は明日から。｜SONE-682");
const target = { id: "recEfvfO65s5S0o1f", handle: "FANZAdougaX", type: "セール告知系", genres: [], note: "n", status: "稼働", reply_restriction: "不明", no_repropose: false, last_reply_at: "2026-09-18T13:21:33.000Z" };
const OK96 =
  "先行配信の開始おめでとうございます。深夜にまとめて告知される形は、翌朝に確認する側としても予定が立てやすくて助かります。今週の動きも追いかけます。今後の告知も楽しみにしています。";

test("normalizeTargets / normalizeReplies は MCP 生出力（cellValuesByFieldId）を受ける", () => {
  const t = normalizeTargets({
    records: [{ id: "recX", cellValuesByFieldId: { fldaWVD2Hs0AeWURb: "@abc", fldIgWtSHvJ44v5Pi: { id: "sel", name: "女優本人" }, fldlBROgusXj2PZTs: true, fld212NAEGBWRujwI: { name: "あり" } } }],
  });
  assert.equal(t[0].handle, "abc");
  assert.equal(t[0].type, "女優本人");
  assert.equal(t[0].no_repropose, true);
  assert.equal(t[0].reply_restriction, "あり");
  const r = normalizeReplies({ records: [{ id: "recR", cellValuesByFieldId: { fld63cUuOti14Vlnj: "20260918-abc", fld69HPg8Qrm2JVPK: "https://x.com/abc/status/1" } }] });
  assert.equal(r[0].reply_key, "20260918-abc");
});

test("jstDayDiff は JST の暦日差", () => {
  assert.equal(jstDayDiff("2026-09-18T13:21:33.000Z", NOW), 3); // 9/18 22:21 JST → 9/21 = 3 日
  assert.equal(jstDayDiff("2026-09-18T16:00:00.000Z", NOW), 2); // 9/19 01:00 JST → 9/21 = 2 日
});

test("checkStop: 3 日以上前なら生成可、3 日未満なら停止（裁定 G）", () => {
  assert.equal(checkStop({ line, target, replies: [], now: NOW }), null);
  const recent = { ...target, last_reply_at: "2026-09-19T13:00:00.000Z" };
  assert.match(checkStop({ line, target: recent, replies: [], now: NOW }), /3 日以内/);
});

test("checkStop: 同日 2 件目・記録済み URL・対象外", () => {
  assert.match(checkStop({ line, target, replies: [{ reply_key: "20260921-FANZAdougaX" }], now: NOW }), /2 件目/);
  assert.match(checkStop({ line, target, replies: [{ reply_key: "20260918-FANZAdougaX", target_post_url: "https://twitter.com/FANZAdougaX/status/2100752031036342529" }], now: NOW }), /記録済み/);
  assert.match(checkStop({ line, target: { ...target, no_repropose: true }, replies: [], now: NOW }), /no_repropose/);
  assert.match(checkStop({ line, target: { ...target, reply_restriction: "あり" }, replies: [], now: NOW }), /reply_restriction/);
  assert.equal(checkStop({ line, target: null, replies: [], now: NOW }), null, "台帳未登録でも生成は続行");
});

test("generateForLine: stub で 3 案生成 → ガード通過 → generated", async () => {
  const gen = stubGenerator({ A: OK96, B: OK96, C: OK96 });
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.equal(item.replyKey, "20260921-FANZAdougaX");
  assert.equal(item.knowledgeMode, "none");
  assert.equal(item.usage.calls, 1);
  assert.ok(["A", "B", "C"].every((t) => item.drafts[t].guard.ok));
});

test("generateForLine: NG 案だけを再生成し、最大 2 回で打ち切る", async () => {
  const bad = OK96.slice(0, 90) + "ぜひチェックを。";
  const gen = stubGenerator([{ A: OK96, B: bad, C: OK96 }, { B: bad }, { B: OK96 }]);
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.equal(item.usage.calls, 3);
  assert.equal(item.drafts.B.attempts, 3);
  assert.equal(item.drafts.A.attempts, 1);

  const gen2 = stubGenerator([{ A: OK96, B: bad, C: OK96 }, { B: bad }, { B: bad }]);
  const item2 = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen: gen2 });
  assert.match(item2.status, /一部生成不能（B/);
  assert.equal(item2.usage.calls, 3);
});

test("generateForLine: refusal は生成不能として記録", async () => {
  const gen = async () => ({ stop_reason: "refusal", stop_details: { category: "x" }, text: "", usage: null });
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.match(item.status, /refusal/);
});

test("generateForLine: 作品知識があれば B の数値は出典検査に通る／出演者名は敬称必須", async () => {
  const knowledge = { content_id: "sone00682", title: "T", volume: "185", actress: ["瀬戸環奈"], genre: [], fetched_at: "2026-09-18T00:00:00Z" };
  const b = OK96.slice(0, 80) + "瀬戸環奈さんの作品は収録185分ですね。";
  const gen = stubGenerator({ A: OK96, B: b, C: OK96 });
  const item = await generateForLine({ line, target, knowledge, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.equal(item.knowledgeMode, "cache");
  const gen2 = stubGenerator({ A: OK96, B: OK96.slice(0, 80) + "瀬戸環奈の作品は収録200分ですね。", C: OK96 });
  const item2 = await generateForLine({ line, target, knowledge, replies: [], now: NOW, system: "s", gen: gen2, maxRegen: 0 });
  const rules = item2.drafts.B.guard.failures.map((f) => f.rule);
  assert.ok(rules.includes("R7") && rules.includes("R9"));
});

test("PROMPT.md の SYSTEM が読める", () => {
  const s = loadSystemPrompt();
  assert.ok(s.startsWith("あなたは"));
  assert.ok(s.includes("C 型を優先"));
});
