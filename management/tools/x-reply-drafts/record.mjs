// 束2 リプ案生成ツール — x_replies / x_targets の記録 payload 生成（純関数 + CLI）
// 設計書 §5・§10-1 E/G: ツールは payload JSON を出力するだけ。書き込みは Claude Code の Airtable MCP
// （create_records_for_table / update_records_for_table）で行い、§10 の読み戻しまで含める。
// Airtable PAT は発行しない（裁定 E）。本ファイルはネットワークに触れない。
//
// CLI:
//   node record.mjs --create drafts.json --pick FANZAdougaX=C [--pick honnaka_NN=A ...] [--out payload.json]
//   node record.mjs --posted --record recXXX --target recYYY --url https://x.com/vodnavi_jp/status/NNN [--out payload.json]
//   node record.mjs --snowflake <id>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMain } from "./parse.mjs";
import { checkPayloadForbidden } from "./guards.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FIELDS = JSON.parse(fs.readFileSync(path.join(HERE, "airtable-fields.json"), "utf8"));

const TWITTER_EPOCH_MS = 1288834974657n;

/** X snowflake → ISO(UTC)。9/18 の 6 件は CSO 側でこの方式で posted_at を復元済み。 */
export function snowflakeToIso(id) {
  const s = String(id).trim();
  if (!/^\d{5,25}$/.test(s)) throw new Error(`snowflake が不正: ${s}`);
  const ms = (BigInt(s) >> 22n) + TWITTER_EPOCH_MS;
  return new Date(Number(ms)).toISOString();
}

/** `https://x.com/<handle>/status/<id>` から id を抽出。 */
export function extractStatusId(url) {
  const m = String(url ?? "").trim().match(/\/status(?:es)?\/(\d{5,25})(?:[/?#]|$)/);
  return m ? m[1] : null;
}

/** JST の YYYYMMDD（Git Bash の TZ は GMT に落ちるため UTC+9 を手計算）。 */
export function jstYmd(date = new Date()) {
  const j = new Date(date.getTime() + 9 * 3600 * 1000);
  return `${j.getUTCFullYear()}${String(j.getUTCMonth() + 1).padStart(2, "0")}${String(j.getUTCDate()).padStart(2, "0")}`;
}

/** reply_key = YYYYMMDD-<handle>（裁定 G: suffix 回避なし）。 */
export function replyKeyFor(handle, date = new Date()) {
  return `${jstYmd(date)}-${String(handle).replace(/^@/, "")}`;
}

/** x_replies 1 行の create payload（reply_post_id / posted_at は空のまま）。 */
export function buildCreatePayload({ replyKey, targetRecordId, targetPostUrl, replyText, draftUsed }) {
  const F = FIELDS.x_replies.fields;
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(targetRecordId ?? ""))) throw new Error(`target の recordId が不正: ${targetRecordId}`);
  if (!["A", "B", "C"].includes(draftUsed)) throw new Error(`draft_used が不正: ${draftUsed}`);
  if (!extractStatusId(targetPostUrl)) throw new Error(`target_post_url が status URL でない: ${targetPostUrl}`);
  const payload = {
    tableId: FIELDS.x_replies.tableId,
    records: [
      {
        fields: {
          [F.reply_key]: replyKey,
          [F.target]: [targetRecordId],
          [F.target_post_url]: targetPostUrl,
          [F.reply_text]: replyText,
          [F.draft_used]: draftUsed,
        },
      },
    ],
  };
  // 裁定 E: 書き込み前に URL/af_id/vodnavi の混入 0 を機械検査（target_post_url は URL そのものなので除外）
  const hits = checkPayloadForbidden(payload, [F.target_post_url]);
  if (hits.length) throw new Error("payload に禁止トークン: " + JSON.stringify(hits));
  return payload;
}

/** 投稿後: x_replies に reply_post_id / posted_at、x_targets に last_reply_at を書く update payload。 */
export function buildPostedPayload({ recordId, targetRecordId, replyUrl }) {
  const F = FIELDS.x_replies.fields;
  const T = FIELDS.x_targets.fields;
  const id = extractStatusId(replyUrl);
  if (!id) throw new Error(`リプ URL から status id を取れない: ${replyUrl}`);
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(recordId ?? ""))) throw new Error(`x_replies の recordId が不正: ${recordId}`);
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(targetRecordId ?? ""))) throw new Error(`x_targets の recordId が不正: ${targetRecordId}`);
  const postedAt = snowflakeToIso(id);
  return {
    x_replies: { tableId: FIELDS.x_replies.tableId, records: [{ id: recordId, fields: { [F.reply_post_id]: id, [F.posted_at]: postedAt } }] },
    x_targets: { tableId: FIELDS.x_targets.tableId, records: [{ id: targetRecordId, fields: { [T.last_reply_at]: postedAt } }] },
    reply_post_id: id,
    posted_at: postedAt,
  };
}

function parseArgs(argv) {
  const a = { picks: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--pick") a.picks.push(argv[++i]);
    else if (k.startsWith("--")) {
      const nxt = argv[i + 1];
      if (nxt == null || nxt.startsWith("--")) a[k.slice(2)] = true;
      else a[k.slice(2)] = argv[++i];
    }
  }
  return a;
}

if (isMain(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  let out;
  if (a.snowflake) {
    out = { id: String(a.snowflake), posted_at: snowflakeToIso(a.snowflake) };
  } else if (a.create) {
    const drafts = JSON.parse(fs.readFileSync(a.create, "utf8"));
    if (drafts.dry_run) throw new Error("dry-run の出力（停止判定を無効化して生成したもの）は記録 payload にしない");
    const picks = Object.fromEntries(a.picks.map((p) => p.split("=")));
    const records = [];
    for (const item of drafts.items ?? []) {
      const pick = picks[item.handle];
      if (!pick) continue;
      if (item.status !== "generated") throw new Error(`${item.handle} は生成済みではない（status=${item.status}）`);
      const d = item.drafts?.[pick];
      if (!d || !d.guard?.ok) throw new Error(`${item.handle} の ${pick} 案はガード未通過または存在しない`);
      const p = buildCreatePayload({ replyKey: item.replyKey, targetRecordId: item.target?.id, targetPostUrl: item.postUrl, replyText: d.text, draftUsed: pick });
      records.push(...p.records);
    }
    if (!records.length) throw new Error("--pick で選ばれた案がない");
    out = { tableId: FIELDS.x_replies.tableId, count: records.length, records };
  } else if (a.posted) {
    out = buildPostedPayload({ recordId: a.record, targetRecordId: a.target, replyUrl: a.url });
  } else {
    process.stderr.write("usage: node record.mjs --create drafts.json --pick <handle>=<A|B|C> [--out f] | --posted --record rec… --target rec… --url … [--out f] | --snowflake <id>\n");
    process.exit(2);
  }
  const text = JSON.stringify(out, null, 2) + "\n";
  if (a.out) {
    fs.writeFileSync(a.out, text);
    process.stderr.write(`[record] wrote ${a.out}\n`);
  } else process.stdout.write(text);
}
