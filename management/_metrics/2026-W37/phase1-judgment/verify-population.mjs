/**
 * Phase 1 判定 — §21-6 母集団4条件の実在確認（2026-09-12 当日に実行する）
 *
 * 【厳守】本スクリプトが確認するのは条件③④（直接 URL 200 / 対照 404）のみ。
 *   条件①（ステータス=投稿済）②（ポストID 非空）は Airtable 側で確認する。
 * 【厳守】本文（#PR / moterist-006）の事後検証は構造的に不能（SPA シェル）。
 *   投稿前の HUMAN 目視が正であり、本スクリプトは「実在」までしか示さない（§21-5-1）。
 * 【厳守】404 だった投稿は母集団から除外し、除外件数と対象を判定報告に明記する（§21-6-6）。
 *   除外により動画が3件未満になった場合は §21-5 の判定不能条項を適用する。
 *
 * 使い方: node verify-population.mjs
 * 出力  : verify-population-<YYYYMMDD-HHMM>.json
 */
import { writeFileSync } from "node:fs";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const GAP_MS = 1000;                 // 逐次。X 側へ負荷を掛けない
const CONTROL_ID = "1111111111111111111"; // 対照＝存在しない ID（判別力の提示に必須）

// ── 母集団（2026-09-11 05:0x JST 時点・Airtable 実読み + PHASE1_VIDEO_LOG）──────
// side: "video" = Phase 1 動画（Airtable 外・HUMAN 投稿） / "text" = テキスト側
const POP = [
  { side:"text",  postId:"2094757256315252977", due:"2026-09-01 21:00", type:"T1改",            name:"W9-04 北岡果林 SQTE-628" },
  { side:"text",  postId:"2094779902343946709", due:"2026-09-01 22:30", type:"T5コンシェルジュ", name:"W9-18 時間が溶ける前に" },
  { side:"text",  postId:"2095119566451970540", due:"2026-09-02 21:00", type:"T1改",            name:"W9-05 三好佑香 PRED-812" },
  { side:"text",  postId:"2095142233317986621", due:"2026-09-02 22:30", type:"TG",              name:"W9-19 TG-17 明細の表記" },
  { side:"text",  postId:"2095482055236702592", due:"2026-09-03 21:00", type:"T1改",            name:"W9-06 逢沢みゆ WAAA-628" },
  { side:"text",  postId:"2095504663818703276", due:"2026-09-03 22:30", type:"T5コンシェルジュ", name:"W9-20 探す時間のほうが長い" },
  { side:"text",  postId:"2095844440296341979", due:"2026-09-04 21:00", type:"T1改",            name:"W9-07 博多彩葉 SNOS-172" },
  { side:"video", postId:"2095848071104204869", due:"2026-09-04 21:14", type:"動画A型",         name:"1本目 1sun00067a 美園和花" },
  { side:"text",  postId:"2095867058118398395", due:"2026-09-04 22:30", type:"TG",              name:"W9-21 TG-18 FANZA TVとは" },
  { side:"text",  postId:"2096206748931547436", due:"2026-09-05 21:00", type:"T1改",            name:"W9-08 羽川るる MIDA-455" },
  { side:"video", postId:"2096217605006885360", due:"2026-09-05 21:43", type:"動画A型",         name:"2本目 1start00631 天神羽衣/大浦真奈美" },
  { side:"text",  postId:"2096229391009292566", due:"2026-09-05 22:30", type:"T5コンシェルジュ", name:"W9-22 ジャンル名で探す前に" },
  { side:"text",  postId:"2096569168317280304", due:"2026-09-06 21:00", type:"T1改",            name:"W9-09 清野咲 CAWD-891" },
  { side:"text",  postId:"2096591782532247824", due:"2026-09-06 22:30", type:"TG",              name:"W9-23 TG-19 評判と向かない人" },
  { side:"text",  postId:"2096931659736121707", due:"2026-09-07 21:00", type:"T1改",            name:"W9-10 桃園怜奈 JUVR-277" },
  { side:"text",  postId:"2096954216279404729", due:"2026-09-07 22:30", type:"T5コンシェルジュ", name:"W9-24 候補が多すぎる夜に" },
  { side:"text",  postId:"2097294046519574586", due:"2026-09-08 21:00", type:"T1改",            name:"W9-11 未歩なな SONE-665" },
  { side:"text",  postId:"2097309199852089697", due:"2026-09-08 22:00", type:"T3セール",        name:"T3 日替わりセール☆（併走日①）" },
  { side:"text",  postId:"2097316565930660102", due:"2026-09-08 22:30", type:"TG",              name:"W9-25 TG-20 0円で終えるタイミング" },
  { side:"text",  postId:"2097656368773664963", due:"2026-09-09 21:00", type:"T1改",            name:"W9-12 佐々木さき IPZZ-766" },
  { side:"video", postId:"2097662554944544809", due:"2026-09-09 21:25", type:"動画A型",         name:"3本目 miab00677 逢沢みゆ" },
  { side:"text",  postId:"2097678970867056799", due:"2026-09-09 22:30", type:"T5コンシェルジュ", name:"W9-26 新着を上から、をやめる" },
  { side:"text",  postId:"2098018786880152021", due:"2026-09-10 21:00", type:"T1改",            name:"W9-13 松永あかり SDJS-342" },
  { side:"text",  postId:"2098033852593705171", due:"2026-09-10 22:00", type:"T3セール",        name:"T3 日替わりセール◆（併走日②）" },
  { side:"text",  postId:"2098041356757115094", due:"2026-09-10 22:30", type:"TG",              name:"W9-27 TG-21 解約の不安解消" },
  // ▼ 2026-09-11 の2件は本スクリプト作成時点で未配信（承認済）。9/12 実行前に Airtable で
  //    ポストID を読み取り、下の2行のコメントを外して postId を埋めること。
  { side:"text",  postId:"2098381152885068039", due:"2026-09-11 21:00", type:"T1改",            name:"W9-14 小笠原菜乃 DSVR-1933" },
  { side:"text",  postId:"2098403736456446359", due:"2026-09-11 22:30", type:"T5コンシェルジュ", name:"W9-28 時間が溶ける前に" },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jstNow = () => new Date(Date.now() + 9*3600e3).toISOString().replace("T"," ").slice(0,19);
const snowJst = (id) => new Date(Number((BigInt(id)>>22n)+1288834974657n)+9*3600e3).toISOString().replace("T"," ").slice(0,19);

async function probe(id) {
  const url = `https://x.com/vodnavi_jp/status/${id}`;
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
    const body = await r.arrayBuffer();
    return { url, status: r.status, bytes: body.byteLength, ms: Date.now()-t0 };
  } catch (e) {
    return { url, status: null, bytes: null, ms: Date.now()-t0, error: String(e).slice(0,120) };
  }
}

const startedJst = jstNow();
console.log(`=== Phase 1 母集団 §21-6 条件③④ の確認 / 開始 ${startedJst} JST ===`);

// 対照を先に取る（判別力の提示・第113便 §13-6-8 の様式）
const control = await probe(CONTROL_ID);
console.log(`[対照] 無効ID ${CONTROL_ID} : HTTP ${control.status} / ${control.bytes} B`);
if (control.status !== 404) {
  console.log("★ 対照が 404 を返さない。判別力が示せないため、この回の結果を PASS と書かないこと（§10）。");
}
await sleep(GAP_MS);

const results = [];
for (const p of POP) {
  const r = await probe(p.postId);
  const ok = r.status === 200;
  results.push({ ...p, delivered_jst: snowJst(p.postId), ...r, meets_cond_3: ok });
  console.log(`${ok ? "OK " : "★NG"} ${p.side.padEnd(5)} ${p.due} ${p.type.padEnd(14)} ${p.postId} : HTTP ${r.status} / ${r.bytes} B  ${p.name}`);
  await sleep(GAP_MS);
}

const excluded = results.filter(r => !r.meets_cond_3);
const video = results.filter(r => r.side === "video" && r.meets_cond_3);
const text  = results.filter(r => r.side === "text"  && r.meets_cond_3);

console.log("\n=== 集計 ===");
console.log(`判別力（対照が404）: ${control.status === 404 ? "あり" : "★示せていない"}`);
console.log(`母集団に残る 動画 : ${video.length} 件`);
console.log(`母集団に残る テキスト: ${text.length} 件`);
console.log(`除外（HTTP 200 でない）: ${excluded.length} 件`);
excluded.forEach(e => console.log(`  除外 → ${e.due} ${e.type} ${e.postId} HTTP ${e.status} ${e.name}`));
if (video.length < 3) {
  console.log("\n★★ 動画が 3件未満。§21-5 裁定4 の判定不能条項を適用する。");
  console.log("   「Phase 1 未実施・判定不能」と記録し、基準の緩和・事後変更はしない。");
}

const stamp = new Date(Date.now()+9*3600e3).toISOString().replace(/[-:T]/g,"").slice(0,13);
const out = `management/_metrics/2026-W37/phase1-judgment/verify-population-${stamp}.json`;
writeFileSync(out, JSON.stringify({
  started_jst: startedJst, finished_jst: jstNow(),
  control, results,
  summary: { video_ok: video.length, text_ok: text.length, excluded: excluded.length,
             discriminating: control.status === 404 },
  notes: [
    "条件①②は Airtable 側で確認する（本スクリプトは③④のみ）",
    "本文の事後検証は構造的に不能。投稿前の HUMAN 目視が正（§21-5-1）",
    "除外件数と対象は判定報告に必ず明記する（§21-6-6）",
  ],
}, null, 2), "utf8");
console.log(`\n保存: ${out}`);
