/**
 * B'系 第1回で 404 になった cid を FANZA API へ照会する。
 *
 * 目的: **「間欠404」か「作品が API から消えた（＝恒久的に取得できない）」かを分ける。**
 * B系はフレーム構築と測定が同日だったが、B'系のフレームは 2026-09-05 構築で
 * 第1回は 09-09 実施＝**4日の間隔がある**。その間に配信終了した作品は
 * 恒久的に 404 になりうる。**この交絡は B系には無かった。**
 *
 * 【厳守】本スクリプトは app.vodnavi.jp へリクエストしない（FANZA API のみ）。
 * 測定の自前リクエスト量には加算されない。
 */
import { readFileSync } from "node:fs";

const env = readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/.env.local", "utf8");
const g = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");
const API = g("DMM_API_ID"), AFF = g("DMM_AFFILIATE_ID");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = process.argv.slice(2);
if (!targets.length) { console.error("cid を引数で渡すこと"); process.exit(1); }

console.log("| cid | floor | FANZA API | 作品名 |");
console.log("|---|---|---|---|");
for (const t of targets) {
  const [floor, cid] = t.includes("/") ? t.split("/") : ["videoa", t];
  const u = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API}&affiliate_id=${AFF}`
    + `&site=FANZA&service=digital&floor=${floor}&cid=${cid}&hits=1&output=json`;
  let out = "取得不能";
  let title = "-";
  try {
    const r = await fetch(u);
    if (!r.ok) out = `HTTP ${r.status}`;
    else {
      const j = await r.json();
      const items = j.result?.items ?? [];
      out = items.length ? `**存在する**（result_count ${j.result.result_count}）` : "**0件＝API に無い**";
      title = items[0]?.title?.slice(0, 28) ?? "-";
    }
  } catch (e) { out = "例外"; }
  console.log(`| \`${cid}\` | ${floor} | ${out} | ${title} |`);
  await sleep(500);
}
