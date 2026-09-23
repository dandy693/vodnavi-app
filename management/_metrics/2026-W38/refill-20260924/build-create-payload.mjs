// generate-t1 の出力 → MCP create_records_for_table の payload（フィールド ID キー）。
// ステータスは `ストック` 固定（§13 の緩和: status を書く箇所を 1 か所に限定する）。予約日時は書かない。
import { readFileSync, writeFileSync } from "node:fs";
const F = {
  name: "fldSFgqqf40w8D2hQ", text: "fldFMfnZXxnhSviDr", type: "fldWn1DLzKGacDC26",
  status: "fldiGogHs9F7w5t2q", linkUrl: "fldkk8CfCKXyqPNFO", linkKind: "fldohCPGnEjkTQRV6",
  memo: "fldne3ecIJaK6KRmA",
};
const TYPE_T1 = "seliCklhPiE5mDsvA";   // T1改
const STATUS_STOCK = "selqqKxPHjq7HikZw"; // ストック（前回 payload の実測値）
const LINKKIND_SITE = "selMapr1SjVidtkFe"; // サイト
const _raw = JSON.parse(readFileSync(process.argv[2], "utf8"));
const gen = Array.isArray(_raw) ? _raw : (_raw.posts ?? _raw.items ?? _raw.records ?? []);
const records = gen.map((p) => {
  if (p.status !== "ストック") throw new Error(`status が ストック でない: ${p.id} = ${p.status}`);
  if (p.kind !== "T1") throw new Error(`kind が T1 でない: ${p.id}`);
  return {
    fields: {
      [F.name]: p.name,
      [F.text]: p.text,
      [F.type]: { id: TYPE_T1 },
      [F.status]: { id: STATUS_STOCK },
      [F.linkUrl]: p.linkUrl,
      [F.linkKind]: { id: LINKKIND_SITE },
      [F.memo]: `CSO 指示 2026-09-24 朝(木曜PDCA・9/26 以降の予約 0 件)／想定枠 ${p.intendedJst} JST／ガード23件 PASS(生成時 2026-09-24)／テンプレート ${p.template}／予約日時は承認時に設定する`,
    },
  };
});
writeFileSync(process.argv[3], JSON.stringify(records, null, 1) + "\n", "utf8");
console.log(`records=${records.length}`);
for (const r of records) console.log("  ", r.fields[F.name]);
