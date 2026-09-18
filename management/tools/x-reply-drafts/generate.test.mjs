// generate.mjs: 停止判定（裁定 G・dedupe・対象外）と生成ループ（stub・ネットワークなし・裁定 H）
import test from "node:test";
import assert from "node:assert/strict";
import { checkStop, generateForLine, normalizeTargets, normalizeReplies, jstDayDiff, loadSystemPrompt, stubGenerator, replyIntervalDays } from "./generate.mjs";
import { parseLine } from "./parse.mjs";

const NOW = new Date("2026-09-21T03:00:00Z"); // JST 9/21 12:00
const line = parseLine("@FANZAdougaX｜2026-09-21 10:00｜https://x.com/FANZAdougaX/status/2100752031036342529｜第2弾は明日から。｜SONE-682");
const target = { id: "recEfvfO65s5S0o1f", handle: "FANZAdougaX", type: "セール告知系", genres: [], note: "n", status: "稼働", reply_restriction: "不明", no_repropose: false, last_reply_at: "2026-09-18T13:21:33.000Z" };
// 40〜140 字・2 文・定型句なし。本文「第2弾は明日から。」の具体（第2弾）を含む（R14）
const OK96 = "第2弾の開始おめでとうございます。今週の動きも追いかけながら、次の告知を楽しみにしています。";

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

test("checkStop: 再返信間隔は type 別（女優本人 3 日／それ以外 1 日・CSO判定 2026-09-19）", () => {
  assert.equal(replyIntervalDays({ type: "女優本人" }), 3);
  assert.equal(replyIntervalDays({ type: "メーカー公式" }), 1);
  assert.equal(replyIntervalDays({ type: "セール告知系" }), 1);
  assert.equal(replyIntervalDays(null), 1);
  assert.equal(checkStop({ line, target, replies: [], now: NOW }), null, "セール告知系・3 日前 → 可");
  const yesterday = { ...target, last_reply_at: "2026-09-20T03:00:00.000Z" }; // JST 9/20 12:00 → 9/21 は 1 日前
  assert.equal(checkStop({ line, target: yesterday, replies: [], now: NOW }), null, "メーカー等は翌日なら可");
  const sameDay = { ...target, last_reply_at: "2026-09-20T16:00:00.000Z" }; // JST 9/21 01:00 → 0 日前
  assert.match(checkStop({ line, target: sameDay, replies: [], now: NOW }), /再返信間隔 1 日未満/);
  const actress = { ...target, type: "女優本人", last_reply_at: "2026-09-19T13:00:00.000Z" }; // 2 日前
  assert.match(checkStop({ line, target: actress, replies: [], now: NOW }), /再返信間隔 3 日未満/);
  const actressOk = { ...target, type: "女優本人", last_reply_at: "2026-09-18T13:00:00.000Z" }; // 3 日前
  assert.equal(checkStop({ line, target: actressOk, replies: [], now: NOW }), null);
});

test("checkStop: 同日 2 件目・記録済み URL・対象外", () => {
  assert.match(checkStop({ line, target, replies: [{ reply_key: "20260921-FANZAdougaX" }], now: NOW }), /2 件目/);
  assert.match(checkStop({ line, target, replies: [{ reply_key: "20260918-FANZAdougaX", target_post_url: "https://twitter.com/FANZAdougaX/status/2100752031036342529" }], now: NOW }), /記録済み/);
  assert.match(checkStop({ line, target: { ...target, no_repropose: true }, replies: [], now: NOW }), /no_repropose/);
  assert.match(checkStop({ line, target: { ...target, reply_restriction: "あり" }, replies: [], now: NOW }), /reply_restriction/);
  assert.equal(checkStop({ line, target: null, replies: [], now: NOW }), null, "台帳未登録でも生成は続行");
});

test("generateForLine: 知識なしモードは A・C の 2 案だけ（B は求めない・CSO判定 2026-09-19）", async () => {
  let asked = null;
  const gen = async ({ types }) => {
    asked = types;
    return { stop_reason: "end_turn", text: JSON.stringify(Object.fromEntries(types.map((t) => [t, OK96]))), usage: { input_tokens: 0, output_tokens: 0 } };
  };
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.deepEqual(asked, ["A", "C"]);
  assert.deepEqual(item.types, ["A", "C"]);
  assert.equal(item.replyKey, "20260921-FANZAdougaX");
  assert.equal(item.knowledgeMode, "none");
  assert.equal(item.usage.calls, 1);
  assert.ok(item.drafts.A.guard.ok && item.drafts.C.guard.ok && !("B" in item.drafts));
});

test("generateForLine: NG 案だけを再生成し、最大 2 回で打ち切る", async () => {
  const bad = "ぜひチェックを。" + OK96;
  const gen = stubGenerator([{ A: OK96, C: bad }, { C: bad }, { C: OK96 }]);
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.equal(item.usage.calls, 3);
  assert.equal(item.drafts.C.attempts, 3);
  assert.equal(item.drafts.A.attempts, 1);
  assert.equal(item.drafts.C.history.length, 2);

  const gen2 = stubGenerator([{ A: OK96, C: bad }, { C: bad }, { C: bad }]);
  const item2 = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen: gen2 });
  assert.match(item2.status, /一部生成不能（C/);
  assert.equal(item2.usage.calls, 3);
});

test("generateForLine: refusal は生成不能として記録", async () => {
  const gen = async () => ({ stop_reason: "refusal", stop_details: { category: "x" }, text: "", usage: null });
  const item = await generateForLine({ line, target, knowledge: null, replies: [], now: NOW, system: "s", gen });
  assert.match(item.status, /refusal/);
});

test("generateForLine: 作品知識があれば B を生成し、cache 由来の事実（185分）が要る／出演者名は敬称必須", async () => {
  const knowledge = { content_id: "sone00682", title: "T", volume: "185", actress: ["瀬戸環奈"], genre: [], fetched_at: "2026-09-18T00:00:00Z" };
  const b = "瀬戸環奈さんの第2弾は収録185分ですね。今週の動きも追いかけながら、次の告知を楽しみにしています。";
  const gen = stubGenerator({ A: OK96, B: b, C: OK96 });
  const item = await generateForLine({ line, target, knowledge, replies: [], now: NOW, system: "s", gen });
  assert.equal(item.status, "generated");
  assert.equal(item.knowledgeMode, "cache");
  assert.deepEqual(item.types, ["A", "B", "C"]);
  // B が本文の言い換えだけ（cache の事実なし）なら R14
  const gen3 = stubGenerator({ A: OK96, B: OK96, C: OK96 });
  const item3 = await generateForLine({ line, target, knowledge, replies: [], now: NOW, system: "s", gen: gen3, maxRegen: 0 });
  assert.ok(item3.drafts.B.guard.failures.some((f) => f.rule === "R14" && f.detail.includes("cache 由来")));
  const gen2 = stubGenerator({ A: OK96, B: "瀬戸環奈の第2弾は収録200分ですね。今週の動きも追いかけながら、次の告知を楽しみにしています。", C: OK96 });
  const item2 = await generateForLine({ line, target, knowledge, replies: [], now: NOW, system: "s", gen: gen2, maxRegen: 0 });
  const rules = item2.drafts.B.guard.failures.map((f) => f.rule);
  assert.ok(rules.includes("R7") && rules.includes("R9"));
});

test("PROMPT.md の SYSTEM が読める", () => {
  const s = loadSystemPrompt();
  assert.ok(s.startsWith("あなたは"));
  assert.ok(s.includes("C 型を優先"));
});
