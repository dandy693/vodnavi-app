// 束2 リプ案生成ツール — 木曜 PDCA 用の x_replies 集計（純関数 + CLI・ネットワークなし）
// CSO 連絡 2026-09-19 22:2x: 9/24 朝の時点で x_replies を priority 別・type 別に集計して報告
//   （件数・draft_used の内訳・got_like / got_reply の記入状況）。
//
// CLI:
//   node weekly-report.mjs --replies replies.json --targets targets.json [--reactions reactions.json] [--own-posts own_posts.csv] [--since 2026-09-18] [--until 2026-09-24] [--md]
// replies.json / targets.json は Airtable MCP list_records_for_table の生出力（records[].cellValuesByFieldId）でも fields 形でもよい。
// 期間は posted_at（JST の暦日）で絞る。--md で Markdown 表、省略時は JSON。
// reactions.json（任意・CSO 指示 2026-09-19 22:5x）: X 投稿ページを読み取った生カウント
//   { by_reply_post_id: { "<reply_post_id>": { likes, replies, reposts, views, fetched } } }
//   Airtable の got_like / got_reply はチェックボックスで「取得済み・0」と「未取得」を区別できないため、
//   取得済み件数（fetched）と views はこのファイルから数える。無い行は「未取得」。
// --own-posts own_posts.csv（任意・CSO 連絡 2026-09-20）: X Analytics の投稿別 CSV（HUMAN 提供・Premium）。
//   同期間の「自投稿インプレッション中央値」を「リプの表示回数中央値」と並べる（観測のみ・判定基準 10/12＝自投稿の中央値 ≥ 50 は変えない）。
//   列名は揺れるため tolerant に検出する: id＝/(post|tweet)\s*id/i・日時＝/^(time|date|created|posted)/i・インプレッション＝/impression/i。
//   x_replies の reply_post_id と一致する行（＝リプ自身・draft_used A/B/C）は自投稿から除外する。引用ポスト（Q）は自投稿に含める。タイムゾーン表記の無い日時は JST として扱う。
// --ga4-quote ga4_quote.json（任意・CSO 指示 2026-09-21 夜）: ga4-quote-sessions.mjs の出力（utm_medium=quote のセッション）を末尾に添付する。
//   .json でもよい: [{ id, time, impressions }] または { posts: [...] }。
// --follows follows.json（任意・HUMAN 指示 2026-10-01）: フォロー営業の集計（フォロー記録・ブロック件数・推定フォロー中）を末尾に添付する。ブロック＝entries の status=ブロック（status_date で期間判定）。

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
  return { count: 0, draft_used: { A: 0, B: 0, C: 0, Q: 0, "空": 0 }, got_like: 0, got_reply: 0, profile_click_delta_filled: 0, no_post_id: 0, reactions_fetched: 0, likes_sum: 0, replies_sum: 0, views_sum: 0, views: [] };
}

function add(b, r, rx) {
  b.count++;
  const d = ["A", "B", "C", "Q"].includes(r.draft_used) ? r.draft_used : "空"; // Q＝引用ポスト（基盤D・CSO 指示 2026-09-21 夜）
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

/** CSV（RFC4180 風・BOM / CRLF / 引用符内の改行とカンマに対応）→ 行配列。 */
export function parseCsv(text) {
  const t = String(text ?? "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += c;
      continue;
    }
    if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

/** 日時文字列 → Date。タイムゾーン表記が無ければ JST（+09:00）として解釈。解釈不能は null。 */
export function parseTimeJst(v) {
  if (v == null) return null;
  const sv = String(v).trim();
  if (!sv) return null;
  let m = sv.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?\s*(Z|[+-]\d{2}:?\d{2})?$/);
  if (m) {
    const tz = m[7] ? (m[7] === "Z" ? "Z" : m[7].length === 5 ? m[7].slice(0, 3) + ":" + m[7].slice(3) : m[7]) : "+09:00";
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? "00"}${tz}`);
    return isNaN(d) ? null : d;
  }
  m = sv.match(/^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (m) {
    const d = new Date(`${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}T${(m[4] ?? "0").padStart(2, "0")}:${m[5] ?? "00"}:00+09:00`);
    return isNaN(d) ? null : d;
  }
  const d = new Date(sv);
  return isNaN(d) ? null : d;
}

/**
 * 自投稿（X Analytics CSV / JSON）→ [{ id, time(Date|null), impressions(number|null), raw }]。
 * 列名は tolerant に検出。見つからない列は null。
 */
export function normalizeOwnPosts(input) {
  let recs = [];
  if (typeof input === "string") {
    const rows = parseCsv(input);
    if (!rows.length) return { posts: [], columns: null };
    const header = rows[0].map((h) => String(h).trim());
    const idx = (re) => header.findIndex((h) => re.test(h));
    // 【修正 2026-10-01】X Analytics の日本語 CSV は列名「ポストID」。旧正規表現は英語名のみで ID 列を見落とし、リプ自身の除外が効かなかった
    const iId = (() => { const a = idx(/(post|tweet)\s*id|ポスト\s*ID/i); return a >= 0 ? a : idx(/^id$/i); })();
    const iText = idx(/^(text|post text|tweet text|ポスト本文|本文)$/i);
    const iTime = idx(/^(time|date|created|posted|日時|日付|投稿日)/i);
    const iImp = idx(/impression|インプレッション|表示回数/i);
    const columns = { id: iId >= 0 ? header[iId] : null, time: iTime >= 0 ? header[iTime] : null, impressions: iImp >= 0 ? header[iImp] : null, text: iText >= 0 ? header[iText] : null };
    for (const r of rows.slice(1)) {
      recs.push({ id: iId >= 0 ? String(r[iId] ?? "").trim() : null, time: iTime >= 0 ? r[iTime] : null, impressions: iImp >= 0 ? r[iImp] : null, text: iText >= 0 ? r[iText] : null });
    }
    return { posts: finish(recs), columns };
  }
  const arr = Array.isArray(input) ? input : input?.posts ?? input?.records ?? [];
  recs = arr.map((r) => ({ id: r.id ?? r.post_id ?? r.tweet_id ?? null, time: r.time ?? r.posted_at ?? r.date ?? null, impressions: r.impressions ?? null }));
  return { posts: finish(recs), columns: { id: "id", time: "time", impressions: "impressions" } };

  function finish(list) {
    return list.map((r) => {
      const impRaw = r.impressions;
      const imp = impRaw == null || impRaw === "" ? null : Number(String(impRaw).replace(/[,\s]/g, ""));
      const id = r.id == null || r.id === "" ? null : String(r.id).replace(/\D/g, "") || String(r.id);
      // 【修正 2026-10-01】CSV の「日付」列は日単位のみ（例 "Wed, Sep 30, 2026"）で JST 暦日とずれることがある。
      // ID が X の snowflake（17 桁以上）なら投稿時刻はそこから復元する（PDCA 2026-10-01 の 7 と同じ方法）
      const time = id && /^\d{17,}$/.test(id) ? new Date(Number((BigInt(id) >> 22n) + 1288834974657n)) : parseTimeJst(r.time);
      // 本文が「@」で始まる行はリプ（x_replies 未記録の古いリプも含めて自投稿から除く）
      const isReply = typeof r.text === "string" && r.text.trimStart().startsWith("@");
      return { id, time, impressions: imp == null || isNaN(imp) ? null : imp, isReply, raw: r };
    });
  }
}

/**
 * 自投稿の統計（期間は JST 暦日・両端含む・excludeIds＝x_replies の reply_post_id を除外）。
 * 返り値 { n, impressions_median, impressions_sum, excluded_replies, unparsed_time, no_impressions, columns }
 */
export function ownPostsStats(norm, { since = null, until = null, excludeIds = new Set(), asOf = null } = {}) {
  // asOf（Date）を渡すと、その時点で投稿から 24 時間未満の行を中央値から外し件数だけ数える（PDCA 2026-10-01 の 7 の規則）
  const out = { n: 0, impressions_median: null, impressions_sum: 0, excluded_replies: 0, unparsed_time: 0, no_impressions: 0, young_excluded: 0, columns: norm.columns };
  const vals = [];
  for (const p of norm.posts) {
    if ((p.id && excludeIds.has(p.id)) || p.isReply) { out.excluded_replies++; continue; }
    if (since || until) {
      if (!p.time) { out.unparsed_time++; continue; }
      const d = jstYmd(p.time).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
      if (since && d < since) continue;
      if (until && d > until) continue;
    }
    if (p.impressions == null) { out.no_impressions++; continue; }
    if (asOf && p.time && asOf.getTime() - p.time.getTime() < 24 * 3600e3) { out.young_excluded++; continue; }
    vals.push(p.impressions);
  }
  out.n = vals.length;
  out.impressions_sum = vals.reduce((a, b) => a + b, 0);
  out.impressions_median = median(vals);
  return out;
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
/**
 * フォロー営業（follows.json）の週次集計。ブロック件数の行を持つ（HUMAN 指示 2026-10-01）。
 * - フォロー記録: entries の date が期間内の件数（ブロックされた行も「フォロー操作をした」ので数える）
 * - ブロック確認: status=ブロック の行のうち status_date が期間内の件数（累計も併記）
 * - 推定フォロー中: 起点＋entries−ブロック（正は画面実測）
 */
export function followsStats(follows, { since = null, until = null } = {}) {
  const entries = Array.isArray(follows?.entries) ? follows.entries : [];
  const inRange = (d) => !!d && (!since || d >= since) && (!until || d <= until);
  const isBlocked = (e) => String(e?.status || "") === "ブロック";
  const blockedAll = entries.filter(isBlocked);
  const base = follows?.baseline?.following ?? null;
  return {
    followed_in_period: entries.filter((e) => inRange(e.date)).length,
    followed_total: entries.length,
    blocked_in_period: blockedAll.filter((e) => inRange(e.status_date)).length,
    blocked_total: blockedAll.length,
    blocked_handles: blockedAll.map((e) => e.handle),
    estimated_following: base == null ? null : base + entries.length - blockedAll.length,
    baseline: base,
  };
}

export function aggregate({ replies, targets, reactions = null, ownPosts = null, since = null, until = null, ga4Quote = null, follows = null, asOf = null, kpi = null }) {
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
  if (ownPosts != null) {
    // 自投稿から除外するのはリプ自身（A/B/C）だけ。引用ポスト（Q）は「自投稿」として集計に含める（判定指標の中央値にも入る・CSO 指示 2026-09-21 夜）。
    const replyIds = new Set(normalizeRepliesFull(replies).filter((r) => r.draft_used !== "Q").map((r) => r.reply_post_id).filter(Boolean).map(String));
    out.own_posts = ownPostsStats(normalizeOwnPosts(ownPosts), { since, until, excludeIds: replyIds, asOf });
  }
  if (ga4Quote != null) out.ga4_quote = ga4Quote; // ga4-quote-sessions.mjs の出力（utm_medium=quote のセッション）をそのまま添付
  if (follows != null) out.follows = followsStats(follows, { since, until });
  if (kpi != null) out.kpi = kpi; // 主要 2 指標と 10/12 判定のフォロワー数（手入力・HUMAN/CTO が管理画面・GA4 から転記）
  return out;
}

function fmtBucket(b, withRx) {
  const base = `${b.count} | A ${b.draft_used.A} / B ${b.draft_used.B} / C ${b.draft_used.C}${b.draft_used.Q ? ` / Q ${b.draft_used.Q}` : ""}${b.draft_used["空"] ? ` / 空 ${b.draft_used["空"]}` : ""} | ${b.got_like} | ${b.got_reply} | ${b.profile_click_delta_filled}`;
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
  // 第129便 C3: 先頭に「主要 2 指標」と「10/12 判定指標」。以下の表はすべて補助（参考）。
  const K = agg.kpi ?? {};
  const v = (x) => (x == null || x === "" ? "未入力" : x);
  L.push("## 主要 2 指標");
  L.push("");
  L.push("| 指標 | 値 | 期間 | 計測系 |");
  L.push("|---|---|---|---|");
  L.push(`| DMM 成果額（月） | ${v(K.dmm_revenue_month)} | ${v(K.dmm_period)} | DMM 管理画面（ID=すべて・当日分は翌日反映） |`);
  L.push(`| 検索セッション（週） | ${v(K.search_sessions_week)} | ${v(K.search_period)} | GA4（Organic Search・hostName=app.vodnavi.jp・CN 除外） |`);
  L.push("");
  L.push("## 2026-10-12 判定指標（§26-14）");
  L.push("");
  L.push("| 指標 | 現在値 | 基準 | 期間 |");
  L.push("|---|---|---|---|");
  L.push(`| 主指標① リプの表示回数中央値 | ${agg.total.views_median ?? "—"}（n=${agg.total.reactions_fetched}） | ≥ 20（ラベル前 28） | ${agg.period.since ?? "?"} 〜 ${agg.period.until ?? "?"}（判定窓は 2026-09-29〜10-12） |`);
  L.push(`| 主指標② フォロワー数 | ${v(K.followers)}${K.followers_at ? `（${K.followers_at}・HUMAN 実測）` : ""} | ≥ 30（起点 2026-09-24 の 13） | 〜 2026-10-12 |`);
  if (agg.own_posts) L.push(`| 参考 自投稿インプレッション中央値（判定に使わない） | ${agg.own_posts.impressions_median ?? "—"}（n=${agg.own_posts.n}） | — | 同上 |`);
  L.push("");
  L.push("## 補助（参考）");
  L.push("");
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
  if (agg.own_posts) {
    const op = agg.own_posts;
    L.push("");
    L.push("| 比較（観測のみ・判定基準 10/12＝自投稿の中央値 ≥ 50 は変えない） | n | 中央値 | 合計 |");
    L.push("|---|---|---|---|");
    L.push(`| リプの表示回数（reactions.json・取得済みのみ） | ${agg.total.reactions_fetched} | ${agg.total.views_median ?? "—"} | ${agg.total.views_sum} |`);
    L.push(`| 自投稿のインプレッション（X Analytics CSV・HUMAN 提供・リプ自身 ${op.excluded_replies} 件を除外・引用ポスト Q は自投稿に含める${op.young_excluded ? `・24 時間未満 ${op.young_excluded} 件は中央値から除外` : ""}） | ${op.n} | ${op.impressions_median ?? "—"} | ${op.impressions_sum} |`);
    const notes = [];
    if (op.unparsed_time) notes.push(`日時を解釈できず期間判定から外した行 ${op.unparsed_time}`);
    if (op.no_impressions) notes.push(`インプレッション列が空の行 ${op.no_impressions}`);
    if (op.columns) notes.push(`使用した列: id=${op.columns.id ?? "（無し）"} / 日時=${op.columns.time ?? "（無し）"} / インプレッション=${op.columns.impressions ?? "（無し）"}`);
    if (notes.length) L.push("", notes.join("／"));
  }
  if (agg.ga4_quote) {
    const g = agg.ga4_quote;
    L.push("");
    L.push(`| GA4 utm_medium=quote（引用ポスト経由・${g.filter ?? "hostName=app.vodnavi.jp（CN 除外なし＝旧形式）"}・${g.period?.startDate ?? "?"}〜${g.period?.endDate ?? "?"}） | セッション | ユーザー | PV |`);
    L.push("|---|---|---|---|");
    L.push(`| 合計 | ${g.total?.sessions ?? 0} | ${g.total?.users ?? 0} | ${g.total?.pageviews ?? 0} |`);
    for (const r of g.by_content ?? []) L.push(`| utm_content=${r.content} | ${r.sessions} | ${r.users} | ${r.pageviews} |`);
    if (g.note) L.push("", g.note);
  }
  if (agg.follows) {
    const f = agg.follows;
    L.push("");
    L.push("| フォロー営業（follows.json・フォロー操作は HUMAN・正は画面実測） | 期間内 | 累計 |");
    L.push("|---|---|---|");
    L.push(`| フォロー記録 | ${f.followed_in_period} | ${f.followed_total} |`);
    L.push(`| ブロック件数（相手が @vodnavi_jp をブロック・HUMAN 確認・恒久除外） | ${f.blocked_in_period} | ${f.blocked_total}${f.blocked_handles.length ? "（" + f.blocked_handles.map((h) => "@" + h).join("・") + "）" : ""} |`);
    L.push(`| 推定フォロー中（起点 ${f.baseline ?? "?"}＋記録−ブロック） | — | ${f.estimated_following ?? "—"} |`);
  }
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
    process.stderr.write("usage: node weekly-report.mjs --replies replies.json --targets targets.json [--reactions reactions.json] [--own-posts own_posts.csv|.json] [--ga4-quote ga4_quote.json] [--follows follows.json] [--kpi kpi.json] [--as-of \"YYYY-MM-DD HH:MM\"] [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--md]\n");
    process.exit(2);
  }
  const agg = aggregate({
    replies: JSON.parse(fs.readFileSync(a.replies, "utf8")),
    targets: JSON.parse(fs.readFileSync(a.targets, "utf8")),
    reactions: typeof a.reactions === "string" ? JSON.parse(fs.readFileSync(a.reactions, "utf8")) : null,
    ownPosts: typeof a["own-posts"] === "string" ? (a["own-posts"].endsWith(".json") ? JSON.parse(fs.readFileSync(a["own-posts"], "utf8")) : fs.readFileSync(a["own-posts"], "utf8")) : null,
    since: typeof a.since === "string" ? a.since : null,
    until: typeof a.until === "string" ? a.until : null,
    ga4Quote: typeof a["ga4-quote"] === "string" ? JSON.parse(fs.readFileSync(a["ga4-quote"], "utf8")) : null,
    asOf: typeof a["as-of"] === "string" ? parseTimeJst(a["as-of"]) : null,
    follows: typeof a.follows === "string" ? JSON.parse(fs.readFileSync(a.follows, "utf8")) : null,
    kpi: typeof a.kpi === "string" ? JSON.parse(fs.readFileSync(a.kpi, "utf8")) : null,
  });
  process.stdout.write(a.md ? toMarkdown(agg) : JSON.stringify(agg, null, 2) + "\n");
}
