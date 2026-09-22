// CSO裁定 2026-09-23 朝 ③ の検証（g22 / g23 の単体・7 ケース）。実行: node <このファイル>
// リポジトリルートからの相対で生成器を読む（作業ツリー版）。
import { GUARDS } from "../../../../../../app-concierge/scripts/x-post-generator.mjs";
const NAME = "W11-05 T1改 新ありな MIZD-464";
const OK_TEXT = "新ありなの単体作品、MIZD-464。ハイビジョン収録です。\n収録内容・サンプル・出演情報はこちらから↓";
const cases = [
  ["正常な T1改",            { kind: "T1", name: NAME, text: OK_TEXT },            true,  true],
  ["本文＝名称（W11-05 事故）", { kind: "T1", name: NAME, text: NAME },               false, false],
  ["本文が内部ラベル・名称改名済", { kind: "T1", name: "別の名称", text: "W11-05 何か" }, true,  false],
  ["本文が内部ラベルのみ",     { kind: "T1", name: "別の名称", text: "W3-12" },        true,  false],
  ["T3 は対象外",            { kind: "T3", name: "T3 x", text: "T3 x" },            true,  true],
  ["名称が空",               { kind: "T1", name: "", text: OK_TEXT },               true,  true],
  ["前後に空白がある事故形",   { kind: "T1", name: NAME, text: `  ${NAME}  ` },       false, false],
];
let fail = 0;
for (const [label, p, exp22, exp23] of cases) {
  const r22 = GUARDS.g22_text_not_name(p).ok;
  const r23 = GUARDS.g23_text_not_internal_label(p).ok;
  const good = r22 === exp22 && r23 === exp23;
  if (!good) fail++;
  console.log(`${good ? "PASS" : "FAIL"}  ${label.padEnd(24)} g22=${r22}(期待${exp22}) g23=${r23}(期待${exp23})`);
}
console.log(fail === 0 ? "ALL PASS" : `${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
