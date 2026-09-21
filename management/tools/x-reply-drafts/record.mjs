// 束2 リプ案生成ツール — x_replies / x_targets の記録 payload 生成（純関数 + CLI）
// 設計書 §5・§10-1 E/G: ツールは payload JSON を出力するだけ。書き込みは Claude Code の Airtable MCP
// （create_records_for_table / update_records_for_table）で行い、§10 の読み戻しまで含める。
// Airtable PAT は発行しない（裁定 E）。本ファイルはネットワークに触れない。
//
// CLI:
//   node record.mjs --create drafts.json --pick FANZAdougaX=C [--pick honnaka_NN=A ...] [--texts posted.json] [--out payload.json]
//     --texts: { "<handle>": "実際に投稿した本文" }。HUMAN が文面を手直しして投稿した場合、記録は投稿した本文を正とする（CSO判定 2026-09-19 12:1x）。draft_used は --pick の型のまま。
//   node record.mjs --posted --record recXXX --target recYYY --url https://x.com/vodnavi_jp/status/NNN [--out payload.json]
//   node record.mjs --snowflake <id>
// 引用ポスト（基盤D・CSO 指示 2026-09-21 夜）: quote.mjs の出力（kind=quote）を --create に渡す。
//   node record.mjs --create quotes.json --pick attackers_av=Q1 [--texts posted.json] [--replies replies.json] [--out payload.json]
//     draft_used は "Q"・reply_key は YYYYMMDD-Q-<handle>・reply_text は「一言＋改行＋works URL」（URL は guardQuoteFull で 1 本のみ許可）。
//     --replies を渡すと同じ target_post_url が既に記録されていれば止める（同一投稿にリプ＋引用の両方はしない）。
//   node record.mjs --posted --quote --record recXXX --target recYYY --url https://x.com/vodnavi_jp/status/NNN → x_targets.last_quote_at を更新（last_reply_at は触らない）。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMain } from "./parse.mjs";
import { checkPayloadForbidden, guardQuoteFull } from "./guards.mjs";

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

/**
 * x_replies 1 行の create payload（reply_post_id / posted_at は空のまま）。
 * 引用ポスト（draftUsed="Q"）は allowedUrl（works 詳細 URL）を渡す: reply_text は「一言＋改行＋その URL 1 本」だけを許す（guardQuoteFull）。
 */
export function buildCreatePayload({ replyKey, targetRecordId, targetPostUrl, replyText, draftUsed, allowedUrl = null }) {
  const F = FIELDS.x_replies.fields;
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(targetRecordId ?? ""))) throw new Error(`target の recordId が不正: ${targetRecordId}`);
  if (!["A", "B", "C", "Q"].includes(draftUsed)) throw new Error(`draft_used が不正: ${draftUsed}`);
  if (!extractStatusId(targetPostUrl)) throw new Error(`target_post_url が status URL でない: ${targetPostUrl}`);
  if (draftUsed === "Q") {
    if (!allowedUrl) throw new Error("引用ポスト（Q）は allowedUrl（works 詳細 URL）が要る");
    if (!/^\d{8}-Q-/.test(String(replyKey ?? ""))) throw new Error(`引用ポストの reply_key は YYYYMMDD-Q-<handle>: ${replyKey}`);
    const gf = guardQuoteFull(replyText, { allowedUrl });
    if (!gf.ok) throw new Error("引用ポストの本文が全文ガード未通過: " + JSON.stringify(gf.failures));
  } else if (/^\d{8}-Q-/.test(String(replyKey ?? ""))) throw new Error(`リプの reply_key に -Q- は使わない: ${replyKey}`);
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
  // 裁定 E: 書き込み前に URL/af_id/vodnavi の混入 0 を機械検査（target_post_url は URL そのものなので除外）。
  // 引用ポストは reply_text に許可 URL 1 本を含むため、その URL を取り除いた文字列で検査する（URL 以外に vodnavi 等が無いこと）。
  const check = draftUsed === "Q" ? JSON.parse(JSON.stringify(payload)) : payload;
  if (draftUsed === "Q") check.records[0].fields[F.reply_text] = String(replyText).split(allowedUrl).join("");
  const hits = checkPayloadForbidden(check, [F.target_post_url]);
  if (hits.length) throw new Error("payload に禁止トークン: " + JSON.stringify(hits));
  return payload;
}

/**
 * 投稿後: x_replies に reply_post_id / posted_at、x_targets に last_reply_at を書く update payload。
 * quote=true（引用ポスト）は x_targets.last_quote_at を更新し last_reply_at は触らない（CSO 指示 2026-09-21 夜）。
 */
export function buildPostedPayload({ recordId, targetRecordId, replyUrl, quote = false }) {
  const F = FIELDS.x_replies.fields;
  const T = FIELDS.x_targets.fields;
  const id = extractStatusId(replyUrl);
  if (!id) throw new Error(`リプ URL から status id を取れない: ${replyUrl}`);
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(recordId ?? ""))) throw new Error(`x_replies の recordId が不正: ${recordId}`);
  if (!/^rec[A-Za-z0-9]{14}$/.test(String(targetRecordId ?? ""))) throw new Error(`x_targets の recordId が不正: ${targetRecordId}`);
  if (quote && !T.last_quote_at) throw new Error("airtable-fields.json に x_targets.last_quote_at が無い");
  const postedAt = snowflakeToIso(id);
  const targetField = quote ? T.last_quote_at : T.last_reply_at;
  return {
    x_replies: { tableId: FIELDS.x_replies.tableId, records: [{ id: recordId, fields: { [F.reply_post_id]: id, [F.posted_at]: postedAt } }] },
    x_targets: { tableId: FIELDS.x_targets.tableId, records: [{ id: targetRecordId, fields: { [targetField]: postedAt } }] },
    reply_post_id: id,
    posted_at: postedAt,
    ...(quote ? { kind: "quote", x_targets_field: "last_quote_at" } : {}),
  };
}

const normUrl = (u) => String(u ?? "").trim().replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, "x.com/").replace(/[?#].*$/, "").replace(/\/$/, "");

/**
 * quote.mjs の出力（kind=quote）から x_replies の create payload を組む（純関数・CLI --create が使う）。
 * picks = { handle: "Q1"|"Q2" }・texts = { handle: 投稿した本文 }（手直し時・URL はそのまま 1 本残っていること）・replies = 既存 x_replies（同一投稿の重複を止める）。
 */
export function buildQuoteCreateRecords({ quotes, picks, texts = {}, replies = [] }) {
  if (quotes.kind !== "quote") throw new Error("kind=quote の出力ではない（quote.mjs の --out を渡す）");
  if (quotes.dry_run) throw new Error("dry-run の出力（停止判定を無効化して生成したもの）は記録 payload にしない");
  const records = [];
  const overridden = [];
  const seen = new Set();
  for (const item of quotes.items ?? []) {
    const pick = picks[item.handle];
    if (!pick) continue;
    if (!["Q1", "Q2"].includes(pick)) throw new Error(`${item.handle} の --pick は Q1 か Q2: ${pick}`);
    if (!(item.status === "generated" || /^一部生成不能/.test(String(item.status ?? "")))) {
      const alt = (quotes.items ?? []).find((x) => x.handle === item.handle && (x.status === "generated" || /^一部生成不能/.test(String(x.status ?? ""))));
      if (alt) continue;
      throw new Error(`${item.handle} は生成済みではない（status=${item.status}）`);
    }
    if (seen.has(item.handle)) continue;
    seen.add(item.handle);
    const d = item.drafts?.[pick];
    if (!d || !d.ok) throw new Error(`${item.handle} の ${pick} 案はガード未通過または存在しない`);
    if (!item.http?.ok && !item.http?.skipped) throw new Error(`${item.handle} の works ページが HTTP 200 を確認できていない`);
    const dup = replies.find((r) => normUrl(r.target_post_url) === normUrl(item.postUrl));
    if (dup) throw new Error(`${item.handle}: 同じ target_post_url が既に記録されている（${dup.reply_key ?? dup.id}）＝同一投稿にリプ＋引用の両方はしない`);
    const posted = typeof texts[item.handle] === "string" ? texts[item.handle].trim() : null;
    if (posted != null && !posted) throw new Error(`${item.handle} の --texts が空`);
    if (posted != null && posted !== d.full) overridden.push(item.handle);
    const p = buildCreatePayload({ replyKey: item.quoteKey, targetRecordId: item.target?.id, targetPostUrl: item.postUrl, replyText: posted ?? d.full, draftUsed: "Q", allowedUrl: item.url });
    records.push(...p.records);
  }
  if (!records.length) throw new Error("--pick で選ばれた案がない");
  return { records, overridden };
}

/** x_replies（MCP 生出力 / fields 形）→ { id, reply_key, target_post_url }（generate.mjs の normalizeReplies と同じ。循環 import を避けるため別実装）。 */
export function normalizeRepliesLite(raw) {
  const F = FIELDS.x_replies.fields;
  const recs = Array.isArray(raw) ? raw : raw?.records ?? [];
  return recs.map((r) => {
    if (r.cellValuesByFieldId) return { id: r.id, reply_key: r.cellValuesByFieldId[F.reply_key] ?? null, target_post_url: r.cellValuesByFieldId[F.target_post_url] ?? null };
    const f = r.fields ?? r;
    return { id: r.id ?? null, reply_key: f.reply_key ?? null, target_post_url: f.target_post_url ?? null };
  });
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
    if (drafts.kind === "quote") {
      // 引用ポスト（基盤D）: quote.mjs の出力から。draft_used="Q"・本文は「一言＋改行＋works URL」
      const texts = a.texts ? JSON.parse(fs.readFileSync(a.texts, "utf8")) : {};
      const replies = a.replies ? normalizeRepliesLite(JSON.parse(fs.readFileSync(a.replies, "utf8"))) : [];
      const q = buildQuoteCreateRecords({ quotes: drafts, picks, texts, replies });
      out = { tableId: FIELDS.x_replies.tableId, kind: "quote", count: q.records.length, draft_used: "Q", ...(q.overridden.length ? { text_overridden_for: q.overridden } : {}), records: q.records,
        _note: FIELDS.x_replies.choices?.draft_used?.Q ? undefined : "draft_used に選択肢 Q が未登録: 初回は typecast:true で作成する（MCP に選択肢追加ツールが無い）。作成後に get_table_schema で Q の選択肢 ID を読み戻し airtable-fields.json に記す。" };
    } else {
    // 投稿した本文を正とする（HUMAN が手直しした場合）。無いハンドルは案の本文をそのまま使う。
    const texts = a.texts ? JSON.parse(fs.readFileSync(a.texts, "utf8")) : {};
    const records = [];
    const overridden = [];
    // 同一ハンドルが複数行あるとき（同日同ハンドル 2 件目以降は停止・2026-09-20）は生成済みの行を使う。停止行しか無ければエラー。
    // 「一部生成不能」（一部の型だけガード未通過）の行も、選んだ型がガード通過なら記録できる（2026-09-21・attackers_av の B のみ R14 NG で A を投稿した実例）。
    const isUsable = (s) => s === "generated" || /^一部生成不能/.test(String(s ?? ""));
    const seen = new Set();
    for (const item of drafts.items ?? []) {
      const pick = picks[item.handle];
      if (!pick) continue;
      if (!isUsable(item.status)) {
        const alt = (drafts.items ?? []).find((x) => x.handle === item.handle && isUsable(x.status));
        if (alt) continue; // 生成済みの行で処理する
        throw new Error(`${item.handle} は生成済みではない（status=${item.status}）`);
      }
      if (seen.has(item.handle)) continue;
      seen.add(item.handle);
      const d = item.drafts?.[pick];
      if (!d || !d.guard?.ok) throw new Error(`${item.handle} の ${pick} 案はガード未通過または存在しない`);
      const posted = typeof texts[item.handle] === "string" ? texts[item.handle].trim() : null;
      if (posted != null && !posted) throw new Error(`${item.handle} の --texts が空`);
      if (posted != null && posted !== d.text) overridden.push(item.handle);
      const p = buildCreatePayload({ replyKey: item.replyKey, targetRecordId: item.target?.id, targetPostUrl: item.postUrl, replyText: posted ?? d.text, draftUsed: pick });
      records.push(...p.records);
    }
    if (!records.length) throw new Error("--pick で選ばれた案がない");
    out = { tableId: FIELDS.x_replies.tableId, count: records.length, ...(overridden.length ? { text_overridden_for: overridden } : {}), records };
    }
  } else if (a.posted) {
    out = buildPostedPayload({ recordId: a.record, targetRecordId: a.target, replyUrl: a.url, quote: a.quote === true });
  } else {
    process.stderr.write("usage: node record.mjs --create drafts.json|quotes.json --pick <handle>=<A|B|C|Q1|Q2> [--texts posted.json] [--replies replies.json] [--out f] | --posted [--quote] --record rec… --target rec… --url … [--out f] | --snowflake <id>\n");
    process.exit(2);
  }
  const text = JSON.stringify(out, null, 2) + "\n";
  if (a.out) {
    fs.writeFileSync(a.out, text);
    process.stderr.write(`[record] wrote ${a.out}\n`);
  } else process.stdout.write(text);
}
