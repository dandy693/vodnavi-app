// 2 ファイルの items を結合し、CSO が貼った投稿本文と生成本文を機械照合してから posted.json を書く。
// （9/22 の Unicode エスケープ誤り「収錂」の再発防止＝本文は手で打たず drafts から取り出す）
import { readFileSync, writeFileSync } from "node:fs";
const a = JSON.parse(readFileSync("drafts.json", "utf8"));
const b = JSON.parse(readFileSync("drafts2.json", "utf8"));
const merged = { ...a, items: [...a.items, ...b.items.map((it) => ({ ...it, lineNo: a.items.length + it.lineNo }))] };
merged.counts = { lines: merged.items.length, generated: merged.items.length, stopped: 0 };
writeFileSync("drafts_merged.json", JSON.stringify(merged, null, 2) + "\n", "utf8");

// CSO が報告に貼った本文（照合用・ここでの一致が取れなければ止める）
const reported = {
  FANZAdougaX: "50％OFF作品リストにコンカフェを題材にした作品が入っているのですね。対象の幅が広そうで気になります。",
  MOODYZ_official: "恋川こももさんのお忍びデート企画、グラビアでの活躍からの登場という流れで気になる一作ですね。",
};
const posted = {};
let ng = 0;
for (const it of merged.items) {
  const gen = it.drafts?.A ?? null;
  if (!gen) { console.log(`NG ${it.handle}: A 案が無い`); ng++; continue; }
  const same = gen.text === reported[it.handle];
  console.log(`${same ? "一致" : "🔴不一致"} ${it.handle} len=${[...gen.text].length} ok=${gen.guard.ok}`);
  if (!same) {
    console.log(`  生成: ${gen.text}`);
    console.log(`  報告: ${reported[it.handle]}`);
    ng++;
  }
  posted[it.handle] = gen.text; // 手直しなし＝生成本文をそのまま記録する
}
if (ng) { console.log(`\n🔴 不一致 ${ng} 件。posted.json は書かない。`); process.exit(1); }
writeFileSync("posted.json", JSON.stringify(posted, null, 2) + "\n", "utf8");
console.log("\nposted.json / drafts_merged.json を書いた（2 件とも生成本文＝報告本文）");
