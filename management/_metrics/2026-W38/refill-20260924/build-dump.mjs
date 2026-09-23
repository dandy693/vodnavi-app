// posts の dump を作る。1 ページ目＝MCP の結果ファイル（cellValuesByFieldId 形式）、
// 2 ページ目＝会話に返った 31 件を TSV へ写したもの。出力は sync-actress-table.mjs /
// generate-t1.mjs --existing が読むフィールド名キー（primary は Airtable 上 `Name` だが
// スクリプトは `管理ID` で読むためそこへマップする）。
import { readFileSync, writeFileSync } from "node:fs";
const [p1, p2, dst] = process.argv.slice(2);
const MAP = {
  fldSFgqqf40w8D2hQ: "管理ID", fldWn1DLzKGacDC26: "タイプ", fldiGogHs9F7w5t2q: "ステータス",
  fldkk8CfCKXyqPNFO: "リンクURL", fldohCPGnEjkTQRV6: "リンク種別", fldDrNzqVRb9LxxqD: "予約日時",
  fldLdjZEjuCqGt0UH: "ポストID", fldvwbyc1oosQ1k23: "エラー詳細", fldFMfnZXxnhSviDr: "投稿文",
};
const raw = JSON.parse(readFileSync(p1, "utf8"));
const records = raw.records.map((r) => {
  const fields = {};
  for (const [fid, v] of Object.entries(r.cellValuesByFieldId ?? {})) {
    const name = MAP[fid] ?? fid;
    fields[name] = v && typeof v === "object" && "name" in v ? { id: v.id, name: v.name } : v;
  }
  return { id: r.id, createdTime: r.createdTime, fields };
});
const seen = new Set(records.map((r) => r.id));
let added = 0;
for (const line of readFileSync(p2, "utf8").split(/\r?\n/)) {
  if (!line.trim()) continue;
  const [id, name, type, status, linkUrl, linkKind, sched, postId] = line.split("\t");
  if (seen.has(id)) { console.log(`重複スキップ: ${id}`); continue; }
  const fields = { "管理ID": name, "タイプ": { name: type }, "ステータス": { name: status }, "リンクURL": linkUrl || null, "予約日時": sched || null };
  if (linkKind) fields["リンク種別"] = { name: linkKind };
  if (postId) fields["ポストID"] = postId;
  records.push({ id, createdTime: null, fields });
  seen.add(id); added++;
}
writeFileSync(dst, JSON.stringify({ fetched_by: "MCP list_records_for_table (2 pages)", fetched_at_jst: new Date(Date.now() + 9 * 3600e3).toISOString(), records }, null, 1));
console.log(`page1=${raw.records.length} page2_added=${added} total=${records.length} (expected ${raw.metadata?.totalRecordCount})`);
