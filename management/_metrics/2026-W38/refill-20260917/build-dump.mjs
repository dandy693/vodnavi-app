// MCP list_records_for_table の生結果（cellValuesByFieldId）を、sync-actress-table.mjs / audit-posts.mjs が
// 読むフィールド名キーの dump.json へ変換する。primary field は Airtable 上 `Name` だが、
// スクリプトは `管理ID` で読むため、ここで `管理ID` にマップする。
import { readFileSync, writeFileSync } from "node:fs";
const [src, dst] = process.argv.slice(2);
const MAP = {
  fldSFgqqf40w8D2hQ: "管理ID",
  fldWn1DLzKGacDC26: "タイプ",
  fldiGogHs9F7w5t2q: "ステータス",
  fldkk8CfCKXyqPNFO: "リンクURL",
  fldohCPGnEjkTQRV6: "リンク種別",
  fldDrNzqVRb9LxxqD: "予約日時",
  fldLdjZEjuCqGt0UH: "ポストID",
  fldvwbyc1oosQ1k23: "エラー詳細",
  fldFMfnZXxnhSviDr: "投稿文",
  fldne3ecIJaK6KRmA: "作成メモ",
};
const raw = JSON.parse(readFileSync(src, "utf8"));
const records = raw.records.map((r) => {
  const fields = {};
  for (const [fid, v] of Object.entries(r.cellValuesByFieldId ?? {})) {
    const name = MAP[fid] ?? fid;
    fields[name] = v && typeof v === "object" && "name" in v ? { id: v.id, name: v.name } : v;
  }
  return { id: r.id, createdTime: r.createdTime, fields };
});
writeFileSync(dst, JSON.stringify({ fetched_by: "MCP list_records_for_table", records }, null, 1));
console.log(`records=${records.length} total=${raw.metadata?.totalRecordCount}`);
