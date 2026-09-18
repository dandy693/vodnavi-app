// R1〜R15 の陽性・陰性（設計書 §8-1・CSO裁定 2026-09-19・CSO判定 2026-09-19）。語リストは guards.config.json の現行値で検査する。
import test from "node:test";
import assert from "node:assert/strict";
import { guardReply, xWeight, charCount, normalizeNumbers, checkPayloadForbidden, countSentences, hasConcreteFromBody, hintTokens } from "./guards.mjs";

// 40〜140 字・2 文・数字なし・定型句なしの無害な本文（47 字）
const OK = "先行配信の開始おめでとうございます。今週の動きも追いかけながら、次の告知を楽しみにしています。";
const BODY = "✨#本中 本日先行配信スタート！✨ 第1弾は9月21日(月) 朝9時59分まで！ 🎥動画 https://t.co/2Js9MzpOp7 @_tojo_natsu #東條なつ";
const rules = (r) => r.failures.map((f) => f.rule);

test("陰性: 無害な本文は全ガード通過（body あり＝R14 は「先行配信」で具体あり）", () => {
  const r = guardReply(OK, { type: "A", body: BODY });
  assert.equal(r.ok, true, JSON.stringify(r.failures));
  assert.ok(r.metrics.chars >= 40 && r.metrics.chars <= 140);
});

test("R1: URL / ドメイン", () => {
  assert.ok(rules(guardReply(OK + "https://example.com", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " www.example.jp", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " example.co.jp/xyz", { type: "A" })).includes("R1"));
  assert.ok(rules(guardReply(OK + " t.co/abc", { type: "A" })).includes("R1"));
  // 「Fitch.」のような文末ピリオドや日本語の中の英字は誤検知しない
  assert.ok(!rules(guardReply("Fitchは朝と夜に出ます。" + OK, { type: "A" })).includes("R1"));
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
  assert.ok(!rules(guardReply(OK + "お気に入り登録が増えています。", { type: "A" })).includes("R5"), "「登録」単体は陰性");
  assert.ok(rules(guardReply(OK + "今すぐご登録を。", { type: "A" })).includes("R5"), "誘導形は陽性");
  assert.ok(rules(guardReply(OK + "登録してください。", { type: "A" })).includes("R5"));
  // 本文一致で免除: 相手が「クーポン」と書いていれば引用は宣伝ではない
  const t = "クーポンの期間はいつまでですか。";
  assert.ok(rules(guardReply(t + OK, { type: "C" })).includes("R5"));
  assert.ok(!rules(guardReply(t + OK, { type: "C", body: "本日からクーポン配布中 先行配信" })).includes("R5"));
  assert.ok(rules(guardReply(t + OK, { type: "C", body: "本日から配布中 先行配信" })).includes("R5"), "本文に無ければ免除しない");
});

test("R6: 容姿・露骨語", () => {
  assert.ok(rules(guardReply(OK + "美人ですね", { type: "A" })).includes("R6"));
  assert.ok(rules(guardReply(OK + "セクシー", { type: "A" })).includes("R6"));
  // 単漢字は入れていないので「体験」「補足」「全体」は陰性
  assert.ok(!rules(guardReply("全体の体験として補足します。" + OK, { type: "A" })).includes("R6"));
});

test("R7: 敬称は女優名のみ・メーカー名に「さん」は NG（CSO判定 2026-09-19）", () => {
  assert.ok(rules(guardReply("和香なつきの初VRですね。" + OK, { type: "A", names: ["和香なつき"] })).includes("R7"));
  assert.ok(!rules(guardReply("和香なつきさんの初VRですね。" + OK, { type: "A", names: ["和香なつき"] })).includes("R7"));
  assert.ok(!rules(guardReply("初VRですね。" + OK, { type: "A", names: ["和香なつき"] })).includes("R7"), "名前が出なければ対象外");
  assert.ok(rules(guardReply("フィッチさんの企画ですね。" + OK, { type: "A", orgNames: ["フィッチ", "Fitch"] })).includes("R7"));
  assert.ok(!rules(guardReply("フィッチの企画ですね。" + OK, { type: "A", orgNames: ["フィッチ", "Fitch"] })).includes("R7"));
});

test("R8: 字数（40〜140）・X 重み・文数（≤2）", () => {
  assert.ok(rules(guardReply("短い", { type: "A" })).includes("R8"));
  assert.ok(rules(guardReply(OK + OK + OK, { type: "A" })).includes("R8"), "150 字は上限超過");
  assert.ok(rules(guardReply("一文目です。二文目です。三文目です。" + OK, { type: "A" })).some((x) => x === "R8"), "文数 5");
  assert.equal(countSentences("あ。い！う？"), 3);
  assert.equal(countSentences("あ、い。"), 1);
  assert.equal(charCount("あいう\n"), 4);
  assert.equal(xWeight("あa"), 3);
  assert.equal(xWeight("😀"), 2);
});

test("R9: 数値の出典（B は全数値・全案は価格/割引）", () => {
  const b = "収録は185分で第3弾です。" + OK;
  assert.ok(rules(guardReply(b, { type: "B", sources: [] })).includes("R9"));
  assert.ok(!rules(guardReply(b, { type: "B", sources: ["収録 185分", "第3弾"] })).includes("R9"));
  // A/C は一般数値を問わないが、価格・割引は問う
  assert.ok(!rules(guardReply(b, { type: "C", sources: [] })).includes("R9"));
  const price = "今なら1,980円で50%OFFですね。" + OK;
  assert.ok(rules(guardReply(price, { type: "C", sources: ["1,980円"] })).includes("R9"), "50% に出典なし");
  assert.ok(!rules(guardReply(price, { type: "C", sources: ["1,980円", "50％OFF"] })).includes("R9"), "全角％も出典として一致");
  assert.equal(normalizeNumbers("３,７４０件・５０％"), "3740件・50%");
});

test("R11: 虚偽の体験主張（願望形は除外）", () => {
  assert.ok(rules(guardReply("買いました。" + OK, { type: "A" })).includes("R11"));
  assert.ok(rules(guardReply("先週観たばかりです。" + OK, { type: "A" })).includes("R11"));
  assert.ok(!rules(guardReply("早く観たいです。" + OK, { type: "A" })).includes("R11"));
  assert.ok(!rules(guardReply("見た目の話ではなく。" + OK, { type: "A" })).includes("R11"));
});

test("R12: 定型句（CSO判定 2026-09-19・config の語）", () => {
  assert.ok(rules(guardReply("追う側としては嬉しい告知です。" + OK, { type: "A" })).includes("R12"));
  assert.ok(rules(guardReply("時刻が分かると予定が立てやすいです。" + OK, { type: "A" })).includes("R12"));
  assert.ok(rules(guardReply("深夜の告知は助かります。" + OK, { type: "A" })).includes("R12"));
  assert.ok(!rules(guardReply(OK, { type: "A" })).includes("R12"));
});

test("R13: 根拠なし断定語・暦の推定語（本文にあれば引用として免除）", () => {
  assert.ok(rules(guardReply("0時の告知は恒例ですね。" + OK, { type: "A" })).includes("R13"));
  assert.ok(rules(guardReply("毎回まとめて出されている印象があります。" + OK, { type: "A" })).includes("R13"));
  assert.ok(rules(guardReply("定期的に新作が出ますね。" + OK, { type: "A", hasMultiPostEvidence: true })).includes("R13"), "config の R13_exempt_with_evidence=false のため免除されない");
  assert.ok(rules(guardReply("三連休の初日に終わる日程ですね。" + OK, { type: "A", body: "第1弾は9月21日 朝9時59分まで 先行配信" })).includes("R13"), "本文に無い暦語は NG");
  assert.ok(!rules(guardReply("三連休の初日に終わる日程ですね。" + OK, { type: "A", body: "三連休の初日 9月19日まで 先行配信" })).includes("R13"), "本文にあれば引用");
});

test("R14-B: B 型は作品知識が無ければ NG・あれば cache 由来の事実を 1 つ含む", () => {
  const body = "本日先行配信スタート 第1弾は9月21日まで";
  const k = { content_id: "sone00682", title: "T", volume: "185", date: "2026-09-16 00:10:00", series: ["ツンデレ彼女"], genre: ["痴女", "単体作品"], maker: ["P-BOX VR"], actress: ["中城葵"], review: { count: 5, average: "5.00" } };
  assert.ok(rules(guardReply("第1弾は9月21日までなのですね。今週の動きも追いかけます。", { type: "B", body })).includes("R14"), "知識なし");
  assert.ok(rules(guardReply("第1弾は9月21日までなのですね。今週の動きも追いかけます。", { type: "B", body, knowledge: k })).includes("R14"), "本文の言い換えだけ");
  assert.ok(!rules(guardReply("第1弾は9月21日までですね。収録185分の単体作品とのことで気になっています。", { type: "B", body, knowledge: k, sources: [body, JSON.stringify(k)] })).includes("R14"), "185分＝cache の事実");
  assert.ok(!rules(guardReply("9月16日配信のツンデレ彼女シリーズですね。第1弾の期間内に見ておきます。", { type: "B", body, knowledge: k, sources: [body, JSON.stringify(k)] })).includes("R14"), "配信日・シリーズ名");
  assert.ok(!rules(guardReply("第1弾の対象ですね。9月21日まで確認しておきます。", { type: "A", body, knowledge: k })).includes("R14"), "A/C には R14-B を適用しない");
});

test("R16: 日付の斜線表記は NG（「9月18日」に正規化・CTO 追加）", () => {
  assert.ok(rules(guardReply("売れ筋5位は09/18時点の集計でしょうか。更新のタイミングが気になっています。", { type: "C" })).includes("R16"));
  assert.ok(rules(guardReply("9/18の動きが気になります。" + OK, { type: "A" })).includes("R16"));
  assert.ok(!rules(guardReply("9月18日の動きが気になります。" + OK, { type: "A" })).includes("R16"));
});

test("R8: 字数下限は 30（CSO判定 2026-09-19 dry-run #3）", () => {
  assert.ok(!rules(guardReply("先行配信スタートおめでとうございます。初日から売れ筋5位という滑り出しですね。", { type: "A" })).includes("R8"), "39 字は通る");
  assert.ok(rules(guardReply("先行配信おめでとうございます。5位ですね。", { type: "A" })).includes("R8"), "21 字は下限未満");
});

test("R14: 相手投稿本文の具体を 1 つ含む（数値は完全一致・語は本文に含まれること）", () => {
  const body = "#Madonna 本日先行配信スタート‼️ ▾お気に入り登録数*3740 ✨動画 売れ筋 5位(09/18) 無名の原石妻 28歳 https://t.co/x #宝生みさと @misato";
  assert.ok(hasConcreteFromBody("売れ筋5位は強い数字ですね。", body).ok);
  assert.ok(hasConcreteFromBody("お気に入り3,740件ですね。", body).ok, "カンマ付きも正規化して一致");
  assert.ok(!hasConcreteFromBody("新作の告知ですね。第2弾も楽しみです。", body).ok, "本文に無い数値（2）は具体にならない");
  assert.ok(rules(guardReply("新作の告知、季節感があっていいですね。" + OK.slice(19), { type: "A", body })).includes("R14"));
  assert.ok(!rules(guardReply("28歳での出演、先行配信初日から追いかけます。今週の動きが気になります。", { type: "A", body })).includes("R14"));
  assert.ok(!rules(guardReply(OK, { type: "A" })).includes("R14"), "body が無ければ R14 は検査しない");
  // hints: 数字・英字を含む語だけ（漢字だけの断片は渡さない）・#タグ・@・URL は落とす・R6 語幹を含む語は落とす
  const h = hintTokens("本日先行配信スタート 第1弾は9月21日まで 毎日10発中出しノルマ #東條なつ @x https://t.co/y", { min_token_len: 2, stoplist: [] }, ["中出し"]);
  assert.ok(h.includes("第1弾") && h.includes("9月21日"));
  assert.ok(!h.includes("10"), "R6 語を含む連続（毎日10発中出し）の中の数値は渡さない: " + JSON.stringify(h));
  assert.ok(!h.some((x) => x.includes("中出")), JSON.stringify(h));
  const h2 = hintTokens("こだわりのフェラ5️⃣0️⃣％OFFキャンペーン第1弾開催 計4,500作品", { min_token_len: 2, stoplist: [] }, ["フェラ"]);
  assert.ok(h2.includes("50") && h2.includes("4500") && h2.some((x) => x.includes("第1弾")), "単位付きの数値は R6 隣接でも残す・キーキャップ絵文字は数字に: " + JSON.stringify(h2));
  assert.ok(!h.includes("東條なつ") && !h.some((x) => x.includes("t.co")));
});

test("R15: 告知の形式・並べ方・出し方への言及", () => {
  assert.ok(rules(guardReply("告知の出し方がそろっていて見やすいですね。", { type: "A" })).includes("R15"));
  assert.ok(rules(guardReply("作品ごとの並べ方が一定ですね。" + OK, { type: "A" })).includes("R15"));
  assert.ok(!rules(guardReply(OK, { type: "A" })).includes("R15"));
});

test("checkPayloadForbidden: URL/af_id/vodnavi を再検査（許可キー以外）", () => {
  const p = { a: { url: "https://x.com/a/status/1", text: "ok" }, b: ["moterist-004"] };
  assert.equal(checkPayloadForbidden(p).length, 2);
  assert.equal(checkPayloadForbidden(p, ["url"]).length, 1);
  assert.equal(checkPayloadForbidden({ t: "vodnavi" }).length, 1);
  assert.equal(checkPayloadForbidden({ t: "普通の文" }).length, 0);
});

test("2026-09-18 手動下書き 6 件を R1〜R15 に通す（CSO判定 2026-09-19 後の回帰・結果は台帳に記録）", () => {
  const bodies = {
    FANZAdougaX: "⋱フェラ好き必見💋⋰ こだわりのフェラ5️⃣0️⃣％OFFキャンペーン第1弾開催✨ https://t.co/TjffPW5JOe ✅本日から全9弾にわたって対象作品更新❣️ それぞれの期間 計4,500作品 が対象✨ 至高のフェラが楽しめる名作がお得です🤤 @Saika_Kawakita @S1_No1_Style https://t.co/2ALYZ4dtiB",
    Fitch_official: "#肉欲の秋 🍂【PR】50%OFF🌰 https://t.co/9A2oeps9DN #星明日菜 @hoshiasuna522 https://t.co/Ibg25H14yk",
    honnaka_NN: "✨#本中 本日先行配信スタート！✨ ビンビンチ○ポをすぐ搾精！ずぼずぼマンこき中出しナースさんビンビンすぎて治療の邪魔なので毎日10発中出しノルマを課せられた入院生活。 🎥動画 https://t.co/2Js9MzpOp7 @_tojo_natsu #東條なつ https://t.co/dYr6yZaWz8",
    kawaii_pr: "┏━┳━┳━┳━┳━┳━┳━┳━┓ ┃こ┃だ┃わ┃り┃の┃フ┃ェ┃ラ┃ ┗━┻━┻━┻━┻━┻━┻━┻━┛ 50％OFFで楽しめるのは今だけ🍌 第1弾は9月21日(月) 朝9時59分まで！ 🎦動画はコチラ #PR https://t.co/1z8Ezi921r #伊藤舞雪 #FANZA @fanza_sns @mayukiito https://t.co/BGdoulXeE3",
    Madonna_AVinfo: "#Madonna 本日先行配信スタート‼️✨ ▾お気に入り登録数*3740 ✨本日配信作品/売上げ本数順 1位 ✨動画 売れ筋 5位(09/18) NON TITLE 無名の原石妻 28歳 AV出演。 遅れてきた大本命、次世代ミセス誕生ー。 https://t.co/hxxPqwbAc6 #宝生みさと #PR @misato_hojo1010 https://t.co/YGurz4oWzJ",
    PREMIUM_AV: "✨#PREMIUM #VR 新作予約開始！✨ 専属・和香なつき 初VR 僕の彼女は地方女子アナ！怒ったり笑ったり甘えたり素の表情がたくさん！癒しのイチャラブ同棲2SEX！ 🎥動画 https://t.co/hwSFgOgea5 @waka_natsuki_ys #和香なつき #PR https://t.co/Jqo4WKc4x4",
  };
  const six = [
    ["FANZAdougaX", "C", "第2弾への切り替えは第1弾終了の翌朝10時からでしょうか？ 弾ごとの期間が分かると予定が立てやすいです。", "FANZA動画公式"],
    ["Fitch_official", "A", "#肉欲の秋 のタグ、季節感があっていいですね。Fitchは朝と夜で1作ずつ出してくるのが分かりやすいです。", "Fitch"],
    ["honnaka_NN", "A", "先行配信スタートおめでとうございます。本中は0時ちょうどに4作まとめて告知が恒例ですね、深夜に確認する側としては助かります。", "本中"],
    ["kawaii_pr", "C", "第2弾以降にも kawaii* の作品は入りますか？ 弾ごとにレーベルが変わるのか気になっています。", "kawaii*"],
    ["Madonna_AVinfo", "B", "お気に入り登録3,740件で売れ筋5位は、先行配信初日としてはかなり強い数字ですね。今週の動きが気になります。", "マドンナ"],
    ["PREMIUM_AV", "C", "和香なつきさんの初VR、予約開始おめでとうございます。予約者向けの特典や先行配信はありますか？", "PREMIUM"],
  ];
  const results = six.map(([h, type, text, org]) => guardReply(text, { type, names: ["和香なつき"], orgNames: [org], sources: [bodies[h]], body: bodies[h] }));
  assert.deepEqual(results.map((r) => r.metrics.chars), [52, 53, 62, 50, 55, 47]);
  // 実測（2026-09-19）: #1 R12（予定が立てやすい）／#2 R4＋R14／#3 R12（助かります）＋R13（恒例）／#4 R14（本文の具体を含まない）
  // ／#5 R14（B 型は知識ありモードのみ・手動は知識なしで書かれた）／#6 通過
  assert.deepEqual(rules(results[0]), ["R12"]);
  assert.deepEqual(rules(results[1]), ["R4", "R14"]);
  assert.deepEqual(rules(results[2]), ["R12", "R13"]);
  assert.deepEqual(rules(results[3]), ["R14"]);
  assert.deepEqual(rules(results[4]), ["R14"]);
  assert.ok(results[5].ok, JSON.stringify(results[5].failures));
});
