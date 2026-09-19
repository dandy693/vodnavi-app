// 束2 リプ案生成ツール — 木曜 PDCA 用の x_replies 集計（純関数 + CLI・ネットワークなし）
// CSO 連絡 2026-09-19 22:2x: 9/24 朝の時点で x_replies を priority 別・type 別に集計して報告
//   （件数・draft_used の内訳・got_like / got_reply の記入状況）。
//
// CLI:
//   node weekly-report.mjs --replies replies.json --targets targets.json [--reactions reactions.json] [--since 2026-09-18] [--until 2026-09-24] [--md]
// replies.json / targets.json は Airtable MCP list_records_for_table の生出力（records[].cellValuesByFieldId）でも fields 形でもよい。
// 期間は posted_at（JST の暦日）で絞る。--md で Markdown 表、省略時は JSON。
// reactions.json（任意・CSO 指示 2026-09-19 22:5x）: X 投稿ページを読み取った生カウント
//   { by_reply_post_id: { "<reply_post_id>": { likes, replies, reposts, views, fetched } } }
//   Airtable の got_like / got_reply はチェックボックスで「取得済み・0」と「未取得」を区別できないため、
//   取得済み件数（fetched）と views はこのファイルから数える。無い行は「未取得」。

import fs from "node:fs";
import { isMain } from "./parse.mjs";
import { normalizeTargets } from "./generate.mjs";
import { FIELDS, jstYmd } from "./record.mjs";

const cellName = (v) => (v && typeof v === "object" && "name" in v ? v.name : v ?? null);

/** x_replies を集計用に正規化（target は record id → x_targets で type / priority / handle を引く）。 */
export function normalizeRepliesFull(raw) {
  const F = FIELDS.x_replies.fields;
  const recs = Array.isArray(raw) ? raw : raw?.records ?? [];
  return recs.map((r) => {
    if (r.cellValuesByFieldId) {
      const c = r.cellValuesByFieldId;
      const tgt = Array.isArray(c[F.target]) ? c[F.target][0] : null;
      return {
        id: r.id,
        reply_key: c[F.reply_key] ?? null,
        target_id: tgt && typeof tgt === "object" ? tgt.id : tgt ?? null,
        target_name: tgt && typeof tgt === "object" ? tgt.name : null,
        posted_at: c[F.posted_at] ?? null,
        draft_used: cellName(c[F.draft_used]),
        got_like: !!c[F.got_like],
        got_reply: !!c[F.got_reply],
        profile_click_delta: c[F.profile_click_delta] ?? null,
        reply_post_id: c[F.reply_post_id] ?? null,
      };
    }
    const f = r.fields ?? r;
    const tgt = Array.isArray(f.target) ? f.target[0] : f.target;
    return {
      id: r.id ?? null,
      reply_key: f.reply_key ?? null,
      target_id: tgt && typeof tgt === "object" ? tgt.id : tgt ?? null,
      target_name: tgt && typeof tgt === "object" ? tgt.name : null,
      posted_at: f.posted_at ?? null,
      draft_used: cellName(f.draft_used),
      got_like: !!f.got_like,
      got_reply: !!f.got_reply,
      profile_click_delta: f.profile_click_delta ?? null,
      reply_post_id: f.reply_post_id ?? null,
    };
  });
}

function bucket() {
  return { count: 0, draft_used: { A: 0, B: 0, C: 0, "空": 0 }, got_like: 0, got_reply: 0, profile_click_delta_filled: 0, no_post_id: 0, reactions_fetched: 0, likes_sum: 0, replies_sum: 0, views_sum: 0, views: [] };
}

function add(b, r, rx) {
  b.count++;
  const d = ["A", "B", "C"].includes(r.draft_used) ? r.draft_used : "空";
  b.draft_used[d]++;
  if (r.got_like) b.got_like++;
  if (r.got_reply) b.got_reply++;
  if (r.profile_click_delta != null && r.profile_click_delta !== "") b.profile_click_delta_filled++;
  if (!r.reply_post_id) b.no_post_id++;
  if (rx && rx.fetched !== false) {
    b.reactions_fetched++;
    b.likes_sum += Number(rx.likes ?? 0);
    b.replies_sum += Number(rx.replies ?? 0);
    if (rx.views != null) {
      b.views_sum += Number(rx.views);
      b.views.push(Number(rx.views));
    }
  }
}

function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** reactions.json → Map<reply_post_id, {likes, replies, reposts, views, fetched}>（無ければ空）。 */
export function normalizeReactions(raw) {
  const m = new Map();
  const src = raw?.by_reply_post_id ?? raw ?? {};
  for (const [id, v] of Object.entries(src)) {
    if (!/^[0-9]+$/.test(id) || !v || typeof v !== "object") continue;
    m.set(id, v);
  }
  return m;
}

/**
 * 集計本体。since / until は JST の YYYY-MM-DD（両端含む・省略可）。
 * 返り値 { period, total, by_priority, by_type, by_priority_type, by_target, unmatched }
 */
export function aggregate({ replies, targets, reactions = null, since = null, until = null }) {
  const T = normalizeTargets(targets);
  const RX = normalizeReactions(reactions);
  const byId = new Map(T.map((t) => [t.id, t]));
  const byHandle = new Map(T.map((t) => [("@" + t.handle).toLowerCase(), t]));
  const rows = normalizeRepliesFull(replies).filter((r) => {
    if (!r.posted_at) return true; // posted_at 空は期間で落とさず「記入状況」に出す
    const d = jstYmd(new Date(r.posted_at)).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
    if (since && d < since) return false;
    if (until && d > until) return false;
    return true;
  });
  const out = { period: { since, until }, reactions_source: RX.size ? "reactions.json" : null, total: bucket(), by_priority: {}, by_type: {}, by_priority_type: {}, by_target: {}, unmatched: [] };
  for (const r of rows) {
    const t = byId.get(r.target_id) ?? (r.target_name ? byHandle.get(String(r.target_name).toLowerCase()) : null) ?? null;
    if (!t) out.unmatched.push(r.reply_key ?? r.id);
    const pri = String(t?.priority ?? "空");
    const type = t?.type ?? "不明";
    const handle = t ? "@" + t.handle : r.target_name ?? "?";
    const rx = r.reply_post_id ? RX.get(String(r.reply_post_id)) ?? null : null;
    add(out.total, r, rx);
    (out.by_priority[pri] ??= bucket());
    add(out.by_priority[pri], r, rx);
    (out.by_type[type] ??= bucket());
    add(out.by_type[type], r, rx);
    const k = `${pri}｜${type}`;
    (out.by_priority_type[k] ??= bucket());
    add(out.by_priority_type[k], r, rx);
    (out.by_target[handle] ??= bucket());
    add(out.by_target[handle], r, rx);
  }
  for (const b of [out.total, ...Object.values(out.by_priority), ...Object.values(out.by_type), ...Object.values(out.by_priority_type), ...Object.values(out.by_target)]) {
    b.views_median = median(b.views);
    delete b.views;
  }
  return out;
}

function fmtBucket(b, withRx) {
  const base = `${b.count} | A ${b.draft_used.A} / B ${b.draft_used.B} / C ${b.draft_used.C}${b.draft_used["空"] ? ` / 空 ${b.draft_used["空"]}` : ""} | ${b.got_like} | ${b.got_reply} | ${b.profile_click_delta_filled}`;
  const rx = withRx ? ` | ${b.reactions_fetched}（未取得 ${b.count - b.reactions_fetched}） | ${b.likes_sum} / ${b.replies_sum} | ${b.views_sum}（中央値 ${b.views_median ?? "—"}）` : "";
  return base + rx + (b.no_post_id ? ` | reply_post_id 空 ${b.no_post_id}` : "");
}

export function toMarkdown(agg) {
  const withRx = !!agg.reactions_source;
  const H = withRx
    ? "| 区分 | 件数 | draft_used | got_like ✓ | got_reply ✓ | profile_click_delta 記入 | 反応 取得済 | likes / replies 合計 | views 合計 |"
    : "| 区分 | 件数 | draft_used | got_like ✓ | got_reply ✓ | profile_click_delta 記入 |";
  const S = withRx ? "|---|---|---|---|---|---|---|---|---|" : "|---|---|---|---|---|---|";
  const L = [];
  L.push(`期間: ${agg.period.since ?? "（下限なし）"} 〜 ${agg.period.until ?? "（上限なし）"}（posted_at の JST 暦日・両端含む）`);
  if (withRx) L.push("反応（likes / replies / views）は reactions.json（X 投稿ページの読み取り）から。Airtable の got_like / got_reply は「取得済み・0」と「未取得」を区別しないため「反応 取得済」列で見る。profile_click_delta は投稿ページから取れないため常に未取得。");
  L.push("");
  L.push(H);
  L.push(S);
  L.push(`| **合計** | ${fmtBucket(agg.total, withRx)} |`);
  for (const [k, b] of Object.entries(agg.by_priority).sort()) L.push(`| priority ${k} | ${fmtBucket(b, withRx)} |`);
  for (const [k, b] of Object.entries(agg.by_type).sort()) L.push(`| type ${k} | ${fmtBucket(b, withRx)} |`);
  L.push("");
  L.push(H.replace("| 区分 |", "| priority｜type |"));
  L.push(S);
  for (const [k, b] of Object.entries(agg.by_priority_type).sort()) L.push(`| ${k} | ${fmtBucket(b, withRx)} |`);
  L.push("");
  L.push(H.replace("| 区分 |", "| 対象 |"));
  L.push(S);
  for (const [k, b] of Object.entries(agg.by_target).sort((a, b2) => b2[1].count - a[1].count || (a[0] < b2[0] ? -1 : 1))) L.push(`| ${k} | ${fmtBucket(b, withRx)} |`);
  if (agg.unmatched.length) L.push("", `x_targets に紐づかない行: ${agg.unmatched.join("、")}`);
  return L.join("\n") + "\n";
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const nxt = argv[i + 1];
    if (nxt == null || nxt.startsWith("--")) a[k.slice(2)] = true;
    else a[k.slice(2)] = argv[++i];
  }
  return a;
}

if (isMain(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  if (!a.replies || !a.targets) {
    process.stderr.write("usage: node weekly-report.mjs --replies replies.json --targets targets.json [--reactions reactions.json] [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--md]\n");
    process.exit(2);
  }
  const agg = aggregate({
    replies: JSON.parse(fs.readFileSync(a.replies, "utf8")),
    targets: JSON.parse(fs.readFileSync(a.targets, "utf8")),
    reactions: typeof a.reactions === "string" ? JSON.parse(fs.readFileSync(a.reactions, "utf8")) : null,
    since: typeof a.since === "string" ? a.since : null,
    until: typeof a.until === "string" ? a.until : null,
  });
  process.stdout.write(a.md ? toMarkdown(agg) : JSON.stringify(agg, null, 2) + "\n");
}
