// R1〜R11 の陽性・陰性（設計書 §8-1）。語リストは guards.config.json の現行値で検査する。
import test from "node:test";
import assert from "node:assert/strict";
import { guardReply, xWeight, charCount, normalizeNumbers, checkPayloadForbidden } from "./guards.mjs";

// 80〜140 字を満たす無害な本文（数字を含まない・95 字）
const OK =
  "先行配信の開始おめでとうございます。深夜にまとめて告知される形は、翌朝に確認する側としても予定が立てやすくて助かります。今週の動きも追いかけます。今後の告知も楽しみにしています。";
const rules = (r) => r.failures.map((f) => f.rule);

test("陰性: 無害な本文は全ガード通過", () => {
  const r = guardReply(OK, { type: "A" });
  assert.equal(r.ok, true, JSON.stringify(r.failures));
  assert.ok(r.metrics.chars >= 80 && r.metrics.chars <= 140);
});

test("R1: URL / ドメイン", () => {
  assert.ok(rules(guardReply(OK + "https://example.com", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " www.example.jp", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " example.co.jp/xyz", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " t.co/abc", { type: "A" })).includes("R1"));
  // 「Fitch.」のような文末ピリオドや日本語の中の英字は誤検知しない
  assert.ok(!rules(guardReply(OK.slice(0, 90) + "Fitchは朝と夜に出ます。", { type: "A" })).includes("R1"));
});

test("R2/R3/R4: @ ・自社語・#", () => {
  assert.ok(rules(guardReply(OK + "@x", { type: "A" })).includes("R2"));
  assert.ok(rules(guardReply(OK + "＠x", { type: "A" })).includes("R2"));
  assert.ok(rules(guardReply(OK + "vodnavi", { type: "A" })).includes("R3"));
  assert.ok(rules(guardReply(OK + "ボドナビ", { type: "A" })).includes("R3"));
  assert.ok(rules(guardReply(OK + "moterist-004", { type: "A" })).includes("R3"));
  assert.ok(rules(guardReply(OK + "#tag", { type: "A" })).includes("R4"));
  assert.ok(rules(guardReply(OK + "＃tag", { type: "A" })).includes("R4"));
});

test("R5: 宣伝語（config の語）・「登録」は誘導形のみ・本文引用は免除（CSO裁定 2026-09-19）", () => {
  assert.ok(rules(guardReply(OK + "詳しくはこちら", { type: "A" })).includes("R5"));
  assert.ok(rules(guardReply(OK + "ぜひチェック", { type: "A" })).includes("R5"));
  assert.ok(!rules(guardReply(OK.slice(0, 90) + "お気に入り登録が増えています。", { type: "A" })).includes("R5"), "「登録」単体は陰性");
  assert.ok(rules(guardReply(OK.slice(0, 90) + "今すぐご登録を。", { type: "A" })).includes("R5"), "誘導形は陽性");
  assert.ok(rules(guardReply(OK.slice(0, 90) + "登録してください。", { type: "A" })).includes("R5"));
  // 本文一致で免除: 相手が「クーポン」と書いていれば引用は宣伝ではない
  const t = OK.slice(0, 90) + "クーポンの期間はいつまでですか。";
  assert.ok(rules(guardReply(t, { type: "C" })).includes("R5"));
  assert.ok(!rules(guardReply(t, { type: "C", body: "本日からクーポン配布中" })).includes("R5"));
  assert.ok(rules(guardReply(t, { type: "C", body: "本日から配布中" })).includes("R5"), "本文に無ければ免除しない");
});

test("R6: 容姿・露骨語", () => {
  assert.ok(rules(guardReply(OK + "美人ですね", { type: "A" })).includes("R6"));
  assert.ok(rules(guardReply(OK + "セクシー", { type: "A" })).includes("R6"));
  // 単漢字は入れていないので「体験」「補足」「全体」は陰性
  assert.ok(!rules(guardReply(OK.slice(0, 90) + "全体の体験として補足します。", { type: "A" })).includes("R6"));
});

test("R7: 敬称", () => {
  const base = OK.slice(0, 80);
  assert.ok(rules(guardReply(base + "和香なつきの初VRですね。", { type: "A", names: ["和香なつき"] })).includes("R7"));
  assert.ok(!rules(guardReply(base + "和香なつきさんの初VRですね。", { type: "A", names: ["和香なつき"] })).includes("R7"));
  assert.ok(!rules(guardReply(base + "初VRですね。", { type: "A", names: ["和香なつき"] })).includes("R7"), "名前が出なければ対象外");
});

test("R8: 字数と X 重み", () => {
  assert.ok(rules(guardReply("短い", { type: "A" })).includes("R8"));
  assert.ok(rules(guardReply(OK + OK, { type: "A" })).includes("R8"));
  assert.equal(charCount("あいう\n"), 4);
  assert.equal(xWeight("あa"), 3);
  assert.equal(xWeight("😀"), 2);
});

test("R9: 数値の出典（B は全数値・全案は価格/割引）", () => {
  const b = OK.slice(0, 80) + "収録は185分で第3弾です。";
  assert.ok(rules(guardReply(b, { type: "B", sources: [] })).includes("R9"));
  assert.ok(!rules(guardReply(b, { type: "B", sources: ["収録 185分", "第3弾"] })).includes("R9"));
  // A/C は一般数値を問わないが、価格・割引は問う
  assert.ok(!rules(guardReply(b, { type: "C", sources: [] })).includes("R9"));
  const price = OK.slice(0, 80) + "今なら1,980円で50%OFFですね。";
  assert.ok(rules(guardReply(price, { type: "C", sources: ["1,980円"] })).includes("R9"), "50% に出典なし");
  assert.ok(!rules(guardReply(price, { type: "C", sources: ["1,980円", "50％OFF"] })).includes("R9"), "全角％も出典として一致");
  assert.equal(normalizeNumbers("３,７４０件・５０％"), "3740件・50%");
});

test("R11: 虚偽の体験主張（願望形は除外）", () => {
  const base = OK.slice(0, 80);
  assert.ok(rules(guardReply(base + "買いました。", { type: "A" })).includes("R11"));
  assert.ok(rules(guardReply(base + "先週観たばかりです。", { type: "A" })).includes("R11"));
  assert.ok(!rules(guardReply(base + "早く観たいです。", { type: "A" })).includes("R11"));
  assert.ok(!rules(guardReply(base + "見た目の話ではなく。", { type: "A" })).includes("R11"));
});

test("checkPayloadForbidden: URL/af_id/vodnavi を再検査（許可キー以外）", () => {
  const p = { a: { url: "https://x.com/a/status/1", text: "ok" }, b: ["moterist-004"] };
  assert.equal(checkPayloadForbidden(p).length, 2);
  assert.equal(checkPayloadForbidden(p, ["url"]).length, 1);
  assert.equal(checkPayloadForbidden({ t: "vodnavi" }).length, 1);
  assert.equal(checkPayloadForbidden({ t: "普通の文" }).length, 0);
});

test("2026-09-18 実績 6 件を較正後ガードに通す（CSO裁定 2026-09-19: R8 min 40・R5 誘導形のみ＋本文引用免除・R4 維持）", () => {
  // 相手投稿本文（x.com 投稿ページの <title> から転記・runs/20260918-dryrun/input.txt と同一）
  const bodyMadonna = "#Madonna 本日先行配信スタート‼️✨ ▾お気に入り登録数*3740 ✨本日配信作品/売上げ本数順 1位 ✨動画 売れ筋 5位(09/18) NON TITLE 無名の原石妻 28歳 AV出演。 遅れてきた大本命、次世代ミセス誕生ー。 #宝生みさと #PR";
  const six = [
    ["C", "第2弾への切り替えは第1弾終了の翌朝10時からでしょうか？ 弾ごとの期間が分かると予定が立てやすいです。", ""],
    ["A", "#肉欲の秋 のタグ、季節感があっていいですね。Fitchは朝と夜で1作ずつ出してくるのが分かりやすいです。", "#肉欲の秋 🍂【PR】50%OFF🌰 #星明日菜"],
    ["A", "先行配信スタートおめでとうございます。本中は0時ちょうどに4作まとめて告知が恒例ですね、深夜に確認する側としては助かります。", ""],
    ["C", "第2弾以降にも kawaii* の作品は入りますか？ 弾ごとにレーベルが変わるのか気になっています。", ""],
    ["B", "お気に入り登録3,740件で売れ筋5位は、先行配信初日としてはかなり強い数字ですね。今週の動きが気になります。", bodyMadonna],
    ["C", "和香なつきさんの初VR、予約開始おめでとうございます。予約者向けの特典や先行配信はありますか？", ""],
  ];
  const results = six.map(([type, text, body]) => guardReply(text, { type, names: ["和香なつき"], sources: [body], body }));
  assert.deepEqual(results.map((r) => r.metrics.chars), [52, 53, 62, 50, 55, 47]);
  // R8 は全件通過（40〜140）。#5 の「登録」は誘導形でなく陰性、数値 3,740 / 5 は本文に出典あり
  assert.ok(results.every((r) => !rules(r).includes("R8")));
  assert.deepEqual(rules(results[4]), []);
  assert.ok(!rules(results[5]).includes("R7"));
  // #2 のみ R4（相手のハッシュタグを裸で書き写した・投稿済み・実害なしとして記録のみ）
  assert.deepEqual(rules(results[1]), ["R4"]);
  assert.ok([0, 2, 3, 5].every((i) => results[i].ok), JSON.stringify(results.map((r) => r.failures)));
});
