// quote.mjs（引用ポスト・基盤D・CSO 指示 2026-09-21 夜）: 適格性・停止判定・URL・全文ガード・生成ループ（stub）・記録 payload（ネットワークなし）
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { quoteEligibility, checkQuoteStop, buildWorksUrl, assembleQuote, quoteKeyFor, isQuoteKey, countQuotesToday, generateQuoteForLine, checkWorksUrl, main } from "./quote.mjs";
import { guardQuoteFull, guardReply, loadConfig } from "./guards.mjs";
import { buildCreatePayload, buildPostedPayload, buildQuoteCreateRecords, FIELDS } from "./record.mjs";
import { parseLine } from "./parse.mjs";

const NOW = new Date("2026-09-22T00:00:00Z"); // JST 9/22 09:00
const config = loadConfig();
const line = parseLine("@attackers_av｜2026-09-21 00:20｜https://x.com/attackers_av/status/2101700000000000001｜【PR】 新作配信開始！ 治療法は…（略）｜atvr00073");
const maker = { id: "recMAKER000000001", handle: "attackers_av", display_name: "アタッカーズ", type: "メーカー公式", genres: [], note: null, status: "稼働", reply_restriction: "なし", no_repropose: false, last_reply_at: null };
const knowledge = { content_id: "atvr00073", floor_code: "videoa", title: "【VR】治療法は…", date: "2026-09-21 00:00:17", volume: "88", actress: ["梓ヒカリ"], genre: ["ハイクオリティVR", "8KVR", "単体作品", "VR専用"], maker: ["アタッカーズ"], label: ["アタッカーズ"], series: [], director: [], review: null, fetched_at: "2026-09-21T00:01:00Z" };
const URL = "https://app.vodnavi.jp/works/videoa/atvr00073?utm_source=x&utm_medium=quote&utm_content=attackers_av";
const OK1 = "梓ヒカリさんが出演する新作で、収録時間は88分、配信開始は9月21日となっています。"; // 40 字以上・事実 2（volume・date）＋出演者名（数えない）
const OK2 = "ジャンルはハイクオリティVRで、シリーズものではなく単体作品として配信されている新作です。"; // 事実 2（genre ハイクオリティVR・単体作品）… genre は語ごとに数える

test("buildWorksUrl / assembleQuote / quoteKeyFor", () => {
  assert.equal(buildWorksUrl({ floor: "videoa", contentId: "atvr00073", handle: "@attackers_av" }), URL);
  assert.throws(() => buildWorksUrl({ floor: "videoc", contentId: "x1", handle: "a" }), /floor/);
  assert.throws(() => buildWorksUrl({ floor: "videoa", contentId: "ATVR-073", handle: "a" }), /content_id/);
  assert.equal(assembleQuote("一言です。 ", URL), "一言です。\n" + URL);
  assert.equal(quoteKeyFor("@attackers_av", NOW), "20260922-Q-attackers_av");
  assert.ok(isQuoteKey("20260922-Q-x") && !isQuoteKey("20260922-x"));
  assert.equal(countQuotesToday([{ reply_key: "20260922-Q-a" }, { reply_key: "20260921-Q-b" }, { reply_key: "20260922-c" }], NOW), 1);
});

test("quoteEligibility: 知識あり＋メーカー公式・女優本人＋発売/配信/予約の投稿のみ。セール・ランキング・イベントは除外", () => {
  assert.equal(quoteEligibility({ line, target: maker, knowledge, config }).eligible, true);
  const r1 = quoteEligibility({ line, target: maker, knowledge: null, config });
  assert.equal(r1.eligible, false);
  assert.match(r1.reasons.join(), /知識なし/);
  const r2 = quoteEligibility({ line, target: { ...maker, type: "セール告知系" }, knowledge, config });
  assert.match(r2.reasons.join(), /type 対象外/);
  const sale = parseLine("@attackers_av｜2026-09-21 00:20｜https://x.com/attackers_av/status/2101700000000000002｜新作配信開始！ 今なら50%OFF｜atvr00073");
  const r3 = quoteEligibility({ line: sale, target: maker, knowledge, config });
  assert.equal(r3.eligible, false);
  assert.match(r3.reasons.join(), /セール・ランキング・イベント/);
  const rank = parseLine("@attackers_av｜2026-09-21 00:20｜https://x.com/attackers_av/status/2101700000000000003｜週間ランキング1位になりました｜atvr00073");
  assert.equal(quoteEligibility({ line: rank, target: maker, knowledge, config }).eligible, false);
  const chat = parseLine("@attackers_av｜2026-09-21 00:20｜https://x.com/attackers_av/status/2101700000000000004｜おはようございます｜atvr00073");
  assert.match(quoteEligibility({ line: chat, target: maker, knowledge, config }).reasons.join(), /該当語なし/);
  const r4 = quoteEligibility({ line, target: null, knowledge, config });
  assert.match(r4.reasons.join(), /台帳未登録/);
  const r5 = quoteEligibility({ line, target: maker, knowledge: { ...knowledge, floor_code: "videoc" }, config });
  assert.match(r5.reasons.join(), /floor/);
});

test("checkQuoteStop: 同一投稿にリプ＋引用の両方はしない／同日同ハンドルの引用 2 件目／no_repropose", () => {
  assert.equal(checkQuoteStop({ line, target: maker, replies: [], now: NOW }), null);
  assert.match(checkQuoteStop({ line, target: maker, replies: [{ reply_key: "20260921-attackers_av", target_post_url: "https://twitter.com/attackers_av/status/2101700000000000001" }], now: NOW }), /リプ＋引用の両方はしない/);
  assert.match(checkQuoteStop({ line, target: maker, replies: [{ reply_key: "20260922-Q-attackers_av", target_post_url: "https://x.com/attackers_av/status/9" }], now: NOW }), /引用 2 件目/);
  assert.match(checkQuoteStop({ line, target: { ...maker, no_repropose: true }, replies: [], now: NOW }), /no_repropose/);
});

test("guardReply(type=Q): 40〜80 字・cache 由来の事実 1〜2 個・本文の具体は不要・全数値に出典", () => {
  const ctx = { type: "Q", names: ["梓ヒカリ"], orgNames: ["アタッカーズ"], sources: [line.body, JSON.stringify(knowledge)], body: line.body, knowledge, targetType: "メーカー公式", displayName: "アタッカーズ", postedAtJst: line.postedAtJst, config };
  assert.deepEqual(guardReply(OK1, ctx).failures, []);
  assert.deepEqual(guardReply(OK2, ctx).failures, []);
  const short = guardReply("収録88分の作品です。", ctx);
  assert.ok(short.failures.some((f) => f.rule === "R8" && /字数/.test(f.detail)), JSON.stringify(short.failures));
  const noFact = guardReply("配信が始まったとのことで、こちらの作品も追いかけていきたいと思います。", ctx);
  assert.ok(noFact.failures.some((f) => f.rule === "R14" && /Q 型に cache 由来の事実/.test(f.detail)), JSON.stringify(noFact.failures));
  const promo = guardReply("収録88分・9月21日配信開始の作品です。ぜひチェックしてみてください。", ctx);
  assert.ok(promo.failures.some((f) => f.rule === "R5"));
  const badNum = guardReply("収録88分・9月21日配信開始の作品で、価格は1,980円です。", ctx);
  assert.ok(badNum.failures.some((f) => f.rule === "R9"), JSON.stringify(badNum.failures));
  const tooMany = guardReply("収録88分・9月21日配信・8KVR・ハイクオリティVRの作品です。", ctx);
  assert.ok(tooMany.failures.some((f) => f.rule === "R14" && /最大 3/.test(f.detail)), JSON.stringify(tooMany.failures)); // Q は 3 まで（B は 2）
  const three = guardReply("収録88分・9月21日配信開始の8KVR作品で、梓ヒカリさんが出演されている新作です。", ctx); // 事実 3（88・9月21日・8KVR）
  assert.deepEqual(three.failures, [], JSON.stringify(three.failures));
  // 女優本人向けは「<表示名>さん、」で始める（R17）
  const actressCtx = { ...ctx, targetType: "女優本人", displayName: "梓ヒカリ" };
  assert.ok(guardReply(OK1, actressCtx).failures.some((f) => f.rule === "R17"));
  assert.deepEqual(guardReply("梓ヒカリさん、収録88分・9月21日配信開始の新作ですね。配信を楽しみにしています。", actressCtx).failures, []);
});

test("guardQuoteFull: 自サイト works 詳細 URL 1 本だけを末尾に許す（R1 の例外）", () => {
  assert.deepEqual(guardQuoteFull(assembleQuote(OK1, URL), { allowedUrl: URL }).failures, []);
  assert.ok(guardQuoteFull(OK1, { allowedUrl: URL }).failures.some((f) => f.rule === "Q-URL" && /0 回/.test(f.detail)));
  assert.ok(guardQuoteFull(URL + "\n" + OK1, { allowedUrl: URL }).failures.some((f) => f.rule === "Q-URL" && /末尾/.test(f.detail)));
  assert.ok(guardQuoteFull(assembleQuote(OK1 + " https://example.com/x", URL), { allowedUrl: URL }).failures.some((f) => f.rule === "R1"));
  assert.ok(guardQuoteFull(assembleQuote(OK1 + " #タグ", URL), { allowedUrl: URL }).failures.some((f) => f.rule === "R4"));
  assert.ok(guardQuoteFull(assembleQuote("vodnavi で見ました " + OK1, URL), { allowedUrl: URL }).failures.some((f) => f.rule === "R3"));
  assert.ok(guardQuoteFull(assembleQuote(OK1, URL) + "\n" + URL, { allowedUrl: URL }).failures.some((f) => f.rule === "Q-URL" && /2 回/.test(f.detail)));
  assert.equal(guardQuoteFull(assembleQuote(OK1, URL), { allowedUrl: URL }).metrics.weight, 23 + [...OK1].reduce((a, ch) => a + (ch.codePointAt(0) <= 4351 ? 1 : 2), 0));
});

test("generateQuoteForLine: Q1・Q2 を生成し、NG の型だけ再生成（stub・ネットワークなし）", async () => {
  let call = 0;
  const gen = async ({ types }) => {
    call++;
    const obj = {};
    for (const t of types) obj[t] = call === 1 && t === "Q2" ? "収録88分・9月21日配信開始の作品です。ぜひチェックしてみてください。" : t === "Q1" ? OK1 : OK2;
    return { stop_reason: "end_turn", text: JSON.stringify(obj), usage: { input_tokens: 1, output_tokens: 1 } };
  };
  const r = await generateQuoteForLine({ line, target: maker, knowledge, url: URL, now: NOW, system: "s", gen, config });
  assert.equal(r.status, "generated");
  assert.equal(r.usage.calls, 2, "Q2 が R5 で NG → 2 回目は Q2 だけ再生成");
  assert.equal(r.drafts.Q1.attempts, 1);
  assert.equal(r.drafts.Q2.attempts, 2);
  assert.equal(r.drafts.Q2.history.length, 1);
  assert.ok(r.drafts.Q2.history[0].failures.some((f) => f.rule === "R5"));
  assert.equal(r.drafts.Q1.full, OK1 + "\n" + URL);
  assert.ok(r.drafts.Q1.ok && r.drafts.Q2.ok);
});

test("checkWorksUrl: 200 のみ ok・3xx/404 は ok=false・例外は error（fetch を差し替え）", async () => {
  const mk = (status) => async () => ({ status, arrayBuffer: async () => new ArrayBuffer(0) });
  assert.equal((await checkWorksUrl(URL, { fetchImpl: mk(200) })).ok, true);
  assert.equal((await checkWorksUrl(URL, { fetchImpl: mk(404) })).ok, false);
  assert.equal((await checkWorksUrl(URL, { fetchImpl: mk(308) })).ok, false);
  const e = await checkWorksUrl(URL, { fetchImpl: async () => { throw new Error("boom"); } });
  assert.equal(e.ok, false);
  assert.equal(e.error, "boom");
});

test("buildCreatePayload(Q) / buildPostedPayload(quote) / buildQuoteCreateRecords", () => {
  const F = FIELDS.x_replies.fields;
  const T = FIELDS.x_targets.fields;
  const full = assembleQuote(OK1, URL);
  const p = buildCreatePayload({ replyKey: "20260922-Q-attackers_av", targetRecordId: maker.id, targetPostUrl: line.postUrl, replyText: full, draftUsed: "Q", allowedUrl: URL });
  assert.equal(p.records[0].fields[F.draft_used], "Q");
  assert.equal(p.records[0].fields[F.reply_text], full);
  assert.throws(() => buildCreatePayload({ replyKey: "20260922-Q-attackers_av", targetRecordId: maker.id, targetPostUrl: line.postUrl, replyText: full, draftUsed: "Q" }), /allowedUrl/);
  assert.throws(() => buildCreatePayload({ replyKey: "20260922-attackers_av", targetRecordId: maker.id, targetPostUrl: line.postUrl, replyText: full, draftUsed: "Q", allowedUrl: URL }), /-Q-/);
  assert.throws(() => buildCreatePayload({ replyKey: "20260922-Q-attackers_av", targetRecordId: maker.id, targetPostUrl: line.postUrl, replyText: OK1, draftUsed: "A" }), /-Q- は使わない/);
  assert.throws(() => buildCreatePayload({ replyKey: "20260922-Q-attackers_av", targetRecordId: maker.id, targetPostUrl: line.postUrl, replyText: full + "\nhttps://example.com", draftUsed: "Q", allowedUrl: URL }), /全文ガード/);
  const posted = buildPostedPayload({ recordId: "recREPLY000000001", targetRecordId: maker.id, replyUrl: "https://x.com/vodnavi_jp/status/2101799195137200513", quote: true });
  assert.equal(posted.kind, "quote");
  assert.ok(T.last_quote_at in posted.x_targets.records[0].fields);
  assert.ok(!(T.last_reply_at in posted.x_targets.records[0].fields));
  const quotes = { kind: "quote", dry_run: false, items: [{ handle: "attackers_av", postUrl: line.postUrl, quoteKey: "20260922-Q-attackers_av", url: URL, http: { status: 200, ok: true }, target: { id: maker.id }, status: "generated", drafts: { Q1: { text: OK1, full, ok: true }, Q2: { text: OK2, full: assembleQuote(OK2, URL), ok: true } } }] };
  const rec = buildQuoteCreateRecords({ quotes, picks: { attackers_av: "Q1" } });
  assert.equal(rec.records.length, 1);
  assert.equal(rec.records[0].fields[F.reply_key], "20260922-Q-attackers_av");
  assert.throws(() => buildQuoteCreateRecords({ quotes, picks: { attackers_av: "Q1" }, replies: [{ reply_key: "20260921-attackers_av", target_post_url: line.postUrl }] }), /リプ＋引用の両方はしない/);
  assert.throws(() => buildQuoteCreateRecords({ quotes, picks: { attackers_av: "A" } }), /Q1 か Q2/);
  assert.throws(() => buildQuoteCreateRecords({ quotes: { ...quotes, dry_run: true }, picks: { attackers_av: "Q1" } }), /dry-run/);
  const edited = buildQuoteCreateRecords({ quotes, picks: { attackers_av: "Q2" }, texts: { attackers_av: "手直しした一言です。収録88分・9月21日配信開始の作品。\n" + URL } });
  assert.deepEqual(edited.overridden, ["attackers_av"]);
  assert.throws(() => buildQuoteCreateRecords({ quotes, picks: { attackers_av: "Q2" }, texts: { attackers_av: "URL を落とした手直し" } }), /全文ガード/);
});

test("main: --stub --no-http で候補選定 → 上限（記録済みの当日 Q 件数を引く）→ 対象外の理由（ネットワークなし）", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "quote-test-"));
  const w = (name, obj) => { const f = path.join(dir, name); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
  const l2 = parseLine("@S1_No1_Style｜2026-09-21 00:21｜https://x.com/S1_No1_Style/status/2101700000000000005｜新作配信開始！ ぶっかけ…（略）｜sivr00507");
  const l3 = parseLine("@FANZAdougaX｜2026-09-21 05:00｜https://x.com/FANZAdougaX/status/2101700000000000006｜第3弾は朝9:59まで 50%OFF作品リスト｜");
  const l4 = parseLine("@MOODYZ_official｜2026-09-20 22:00｜https://x.com/MOODYZ_official/status/2101700000000000007｜10月2日発売 新人デビュー作｜mida00812");
  const parsed = w("parsed.json", { lines: [line, l2, l3, l4] });
  const targets = w("targets.json", [maker, { ...maker, id: "recMAKER000000002", handle: "S1_No1_Style", display_name: "S1", priority: 3 }, { ...maker, id: "recMAKER000000003", handle: "FANZAdougaX", type: "セール告知系" }, { ...maker, id: "recMAKER000000004", handle: "MOODYZ_official", display_name: "MOODYZ" }]);
  const k2 = { ...knowledge, content_id: "sivr00507", actress: ["初美なのか"], volume: "67", maker: ["エスワン"], label: ["S1"] };
  const k4 = { ...knowledge, content_id: "mida00812", actress: ["平野楓"], volume: "150", date: "2026-10-02 00:00:00", maker: ["ムーディーズ"], label: [] };
  const knowledgeFile = w("knowledge.json", { 1: knowledge, 2: k2, 4: k4 });
  const replies = w("replies.json", [{ reply_key: "20260922-Q-zzz", target_post_url: "https://x.com/zzz/status/1" }]); // 本日 1 件記録済み → 提示は 1 件
  const stub = w("stub.json", { Q1: OK1, Q2: OK2 });
  const out = path.join(dir, "quotes.json");
  const res = await main(["--parsed", parsed, "--targets", targets, "--knowledge", knowledgeFile, "--replies", replies, "--stub", stub, "--no-http", "--today", "2026-09-22", "--out", out]);
  assert.equal(res.kind, "quote");
  assert.equal(res.limits.recorded_today, 1);
  assert.equal(res.limits.max_per_run, 1);
  const by = Object.fromEntries(res.items.map((i) => [i.handle, i]));
  assert.equal(by.attackers_av.status, "generated");
  assert.equal(by.attackers_av.url, URL);
  assert.equal(by.attackers_av.http.skipped, true);
  assert.match(by.S1_No1_Style.status, /提示上限外/);
  assert.match(by.FANZAdougaX.status, /対象外/);
  assert.match(by.FANZAdougaX.status, /type 対象外/);
  assert.match(by.MOODYZ_official.status, /提示上限外/);
  assert.equal(res.counts.presented, 1);
  assert.ok(fs.existsSync(out));
  // --max 3 なら 3 件提示（MOODYZ は数値が出典なし → stub の一言は 88分/9月21日 で k4 と合わない → R9/R14 で一部生成不能になりうるが status は記録される）
  const res2 = await main(["--parsed", parsed, "--targets", targets, "--knowledge", knowledgeFile, "--stub", stub, "--no-http", "--today", "2026-09-22", "--max", "3"]);
  assert.equal(res2.items.filter((i) => i.url).length, 3);
  assert.ok(res2.items.find((i) => i.handle === "S1_No1_Style").warnings.some((w2) => /priority 3/.test(w2)));
});
