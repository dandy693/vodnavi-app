// 束2 拡張 — 引用ポスト（基盤D）の候補選定・一言生成・URL 付与・works ページ HTTP 200 確認（CSO 指示 2026-09-21 夜）
// 入力はリプ生成（generate.mjs）と同じ parsed / targets / replies / knowledge。朝・夜の抽出結果のうち
//   「知識あり（cache ヒット＝content_id 確定）」∧「メーカー公式」（女優本人はリプ優先＝CSO裁定 2026-09-22 朝・guards.config.json Q_quote.allowed_types）∧「発売・配信開始・予約開始の投稿」（セール・ランキング・イベントは除く）
// を候補にし、引用向き 1〜2 件（max_per_run − 本日記録済みの Q 件数）に対して案 Q1・Q2 を生成する。
// 文面＝一言（40〜80 字・作品の属性）＋ 改行 ＋ works 詳細 URL（https://app.vodnavi.jp/works/<floor>/<content_id>?utm_source=x&utm_medium=quote&utm_content=<handle>）。
// URL はモデルが書かずツールが付ける。ガードはリプと同じ R1〜R18（type=Q）＋ guardQuoteFull（URL は自サイト works 詳細 1 本のみ許可）。
// 提示前に works ページが HTTP 200 であることを確認する（--no-http で省略・テスト用）。Airtable / Supabase には触れない。
//
//   node --env-file=app-concierge/.env.local management/tools/x-reply-drafts/quote.mjs \
//     --parsed parsed.json --targets targets.json [--replies replies.json] --knowledge knowledge.json \
//     [--out quotes.json] [--today YYYY-MM-DD] [--max 2] [--only handle] [--max-regen 2] [--model id] [--stub stub.json] [--dry-run] [--no-http]
//
// --dry-run: 停止判定（記録済み・同日 2 件目・上限）を無効化して生成だけ行う（record.mjs は記録 payload を作らない）。
// --stub: node:test 用。API を呼ばずファイルの応答を返す。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMain } from "./parse.mjs";
import { normalizeTargets, normalizeReplies, callAnthropic, stubGenerator, loadSystemPrompt, DEFAULT_MODEL } from "./generate.mjs";
import { guardReply, guardQuoteFull, loadConfig, applyReplacements, listHits } from "./guards.mjs";
import { jstYmd } from "./record.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const WORKS_BASE = "https://app.vodnavi.jp/works";
export const QUOTE_FLOORS = ["videoa", "anime", "nikkatsu"];
export const QUOTE_TYPES = ["Q1", "Q2"];
export const HTTP_UA = "vodnavi-quote-check/1";

/** reply_key の引用版 = YYYYMMDD-Q-<handle>（CSO 指示 2026-09-21 夜）。 */
export function quoteKeyFor(handle, date = new Date()) {
  return `${jstYmd(date)}-Q-${String(handle).replace(/^@/, "")}`;
}
export function isQuoteKey(key) {
  return /^\d{8}-Q-/.test(String(key ?? ""));
}

/** works 詳細 URL（utm 付き）。floor は videoa / anime / nikkatsu のみ・content_id は小文字英数字と _ のみ。 */
export function buildWorksUrl({ floor, contentId, handle }) {
  if (!QUOTE_FLOORS.includes(floor)) throw new Error(`floor が不正: ${floor}`);
  if (!/^[a-z0-9_]+$/.test(String(contentId ?? ""))) throw new Error(`content_id が不正: ${contentId}`);
  const h = String(handle ?? "").replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(h)) throw new Error(`handle が不正: ${handle}`);
  return `${WORKS_BASE}/${floor}/${contentId}?utm_source=x&utm_medium=quote&utm_content=${h}`;
}

/** 一言 ＋ 改行 ＋ URL。 */
export function assembleQuote(text, url) {
  return `${String(text ?? "").replace(/\s+$/u, "")}\n${url}`;
}

/**
 * 引用候補の適格性（CSO 指示 2026-09-21 夜）。
 * 返り値 { eligible, reasons[], releaseHits[], excludeHits[], floor, contentId }
 */
export function quoteEligibility({ line, target, knowledge, config }) {
  const cfg = (config ?? loadConfig()).Q_quote ?? {};
  const reasons = [];
  if (!knowledge || !knowledge.content_id) reasons.push("知識なし（cache MISS＝content_id 未確定）");
  if (!target) reasons.push("台帳未登録");
  else if (!(cfg.allowed_types ?? ["メーカー公式"]).includes(target.type)) reasons.push(`type 対象外（${target.type ?? "?"}・引用元は ${(cfg.allowed_types ?? ["メーカー公式"]).join("・")} のみ）`);
  const releaseHits = listHits(line.body ?? "", cfg.release_keywords ?? []);
  const excludeHits = listHits(line.body ?? "", cfg.exclude_keywords ?? []);
  if (!releaseHits.length) reasons.push("発売・配信開始・予約開始の投稿ではない（該当語なし）");
  if (excludeHits.length) reasons.push(`セール・ランキング・イベントの投稿は引用しない（該当: ${excludeHits.join("、")}）`);
  const floor = knowledge?.floor_code ?? line.work?.floor ?? null;
  if (knowledge && !QUOTE_FLOORS.includes(floor)) reasons.push(`floor 不明・対象外（${floor ?? "null"}）`);
  return { eligible: reasons.length === 0, reasons, releaseHits, excludeHits, floor, contentId: knowledge?.content_id ?? null };
}

const normUrl = (u) => String(u ?? "").trim().replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, "x.com/").replace(/[?#].*$/, "").replace(/\/$/, "");

/** 本日（JST）に記録済みの引用（reply_key が YYYYMMDD-Q-…）の件数。 */
export function countQuotesToday(replies, now = new Date()) {
  const ymd = jstYmd(now);
  return (replies ?? []).filter((r) => isQuoteKey(r.reply_key) && String(r.reply_key).startsWith(ymd + "-Q-")).length;
}

/** 停止判定: no_repropose／同日同ハンドルの引用 2 件目／同一投稿にリプ＋引用の両方はしない（記録済み）。 */
export function checkQuoteStop({ line, target, replies, now }) {
  if (target?.no_repropose) return "対象外（no_repropose）";
  const key = quoteKeyFor(line.handle, now);
  if (replies.some((r) => r.reply_key === key)) return `停止（同日同ハンドルの引用 2 件目: ${key} が既存）`;
  const dup = replies.find((r) => normUrl(r.target_post_url) === normUrl(line.postUrl));
  if (dup) return `停止（同一投稿にリプ＋引用の両方はしない／記録済み: 同じ target_post_url が ${dup.reply_key ?? dup.id} に存在）`;
  return null;
}

/** works ページの HTTP ステータス確認（GET・リダイレクトは追わない・本文は捨てる）。 */
export async function checkWorksUrl(url, { timeoutMs = 20_000, fetchImpl = fetch } = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetchImpl(url, { method: "GET", redirect: "manual", headers: { "user-agent": HTTP_UA }, signal: ac.signal });
    try {
      await res.arrayBuffer();
    } catch {}
    return { status: res.status, ok: res.status === 200, checked_at: checkedAt };
  } catch (e) {
    return { status: null, ok: false, error: e.name === "AbortError" ? `timeout ${timeoutMs}ms` : String(e.message ?? e), checked_at: checkedAt };
  } finally {
    clearTimeout(timer);
  }
}

function schemaTypes(types) {
  return types;
}

function userPayload({ line, target, knowledge, todayJst, retryReasons }) {
  const p = {
    target: target ? { handle: target.handle, display_name: target.display_name, type: target.type, genres: target.genres, note: target.note } : null,
    post: { posted_at_jst: line.postedAtJst, body: line.body },
    knowledge,
    today_jst: todayJst,
  };
  if (retryReasons) p.retry_reasons = retryReasons;
  return JSON.stringify(p, null, 2);
}

/** 1 行分: Q1・Q2 を生成し、一言のガード（type=Q）→ URL 付与 → 全文ガード（guardQuoteFull）。 */
export async function generateQuoteForLine({ line, target, knowledge, url, now, system, gen, maxRegen = 2, config }) {
  const cfg = config ?? loadConfig();
  const todayJst = jstYmd(now).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  const names = [...(knowledge?.actress ?? [])];
  if (target?.type === "女優本人" && target.display_name) names.push(target.display_name);
  const orgNames = [...(knowledge?.maker ?? []), ...(knowledge?.label ?? [])];
  if (target && target.type !== "女優本人" && target.display_name) orgNames.push(target.display_name);
  const sources = [line.body, knowledge ? JSON.stringify(knowledge) : ""];
  const drafts = {};
  const usage = { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, calls: 0 };
  const warnings = [];
  let pending = [...QUOTE_TYPES];
  let retryReasons = null;
  let refusal = null;
  for (let attempt = 0; attempt <= maxRegen && pending.length; attempt++) {
    const r = await gen({ system, user: userPayload({ line, target, knowledge, todayJst, retryReasons }), types: schemaTypes(pending) });
    usage.calls++;
    usage.input_tokens += r.usage?.input_tokens ?? 0;
    usage.output_tokens += r.usage?.output_tokens ?? 0;
    usage.cache_creation_input_tokens += r.usage?.cache_creation_input_tokens ?? 0;
    usage.cache_read_input_tokens += r.usage?.cache_read_input_tokens ?? 0;
    if (r.stop_reason === "refusal") {
      refusal = `生成不能（refusal: ${r.stop_details?.category ?? "?"}）`;
      break;
    }
    let obj;
    try {
      obj = JSON.parse(r.text);
    } catch {
      warnings.push(`attempt ${attempt + 1}: 応答が JSON でない（stop_reason=${r.stop_reason}）`);
      retryReasons = { all: "前回の応答が JSON として解釈できなかった" };
      continue;
    }
    const nextReasons = {};
    const nextPending = [];
    for (const t of pending) {
      const rep = applyReplacements(String(obj[t] ?? "").trim().replace(/\s*\n+\s*/g, " "), cfg);
      const text = rep.text;
      const g = guardReply(text, { type: "Q", names, orgNames, sources, body: line.body, knowledge, targetType: target?.type ?? null, displayName: target?.display_name ?? null, postedAtJst: line.postedAtJst ?? null, config: cfg });
      const full = assembleQuote(text, url);
      const gf = guardQuoteFull(full, { allowedUrl: url });
      const ok = g.ok && gf.ok;
      const history = [...(drafts[t]?.history ?? [])];
      if (drafts[t] && !drafts[t].ok) history.push({ text: drafts[t].text, failures: [...drafts[t].guard.failures, ...drafts[t].guardFull.failures] });
      drafts[t] = { text, full, ok, guard: g, guardFull: gf, attempts: (drafts[t]?.attempts ?? 0) + 1, history, ...(rep.applied.length ? { replacements: rep.applied } : {}) };
      if (!ok) {
        nextPending.push(t);
        nextReasons[t] = [...g.failures, ...gf.failures].map((f) => `${f.rule}: ${f.detail}`).join(" / ");
      }
    }
    pending = nextPending;
    retryReasons = pending.length ? nextReasons : null;
  }
  const ng = QUOTE_TYPES.filter((t) => !drafts[t]?.ok);
  const status = refusal ?? (ng.length ? `一部生成不能（${ng.join("/")} がガード未通過・最大 ${maxRegen} 回再生成後）` : "generated");
  return { drafts, usage, warnings, status };
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

export async function main(argv = process.argv.slice(2), { fetchImpl = fetch } = {}) {
  const a = parseArgs(argv);
  if (!a.parsed || !a.targets || !a.knowledge) {
    process.stderr.write("usage: quote.mjs --parsed parsed.json --targets targets.json --knowledge knowledge.json [--replies replies.json] [--out quotes.json] [--today YYYY-MM-DD] [--max 2] [--only handle] [--max-regen 2] [--model id] [--stub stub.json] [--dry-run] [--no-http]\n");
    process.exit(2);
  }
  const parsed = JSON.parse(fs.readFileSync(a.parsed, "utf8"));
  const targets = normalizeTargets(JSON.parse(fs.readFileSync(a.targets, "utf8")));
  const replies = a.replies ? normalizeReplies(JSON.parse(fs.readFileSync(a.replies, "utf8"))) : [];
  const knowledgeMap = JSON.parse(fs.readFileSync(a.knowledge, "utf8"));
  const now = a.today ? new Date(`${a.today}T12:00:00+09:00`) : new Date();
  const config = loadConfig();
  const qcfg = config.Q_quote ?? {};
  const system = loadSystemPrompt(path.join(HERE, "PROMPT-Q.md"));
  const model = a.model ?? DEFAULT_MODEL;
  const gen = a.stub ? stubGenerator(JSON.parse(fs.readFileSync(a.stub, "utf8"))) : (args) => callAnthropic({ ...args, model });
  const maxRegen = a["max-regen"] != null ? Number(a["max-regen"]) : 2;
  const dryRun = a["dry-run"] === true;
  const noHttp = a["no-http"] === true;
  const recordedToday = countQuotesToday(replies, now);
  const maxPerRun = a.max != null ? Number(a.max) : Math.max(0, (qcfg.max_per_run ?? 2) - (dryRun ? 0 : recordedToday));

  const items = [];
  let presented = 0;
  const presentedHandles = new Set();
  for (const line of parsed.lines ?? []) {
    if (!line.ok) continue;
    if (a.only && line.handle.toLowerCase() !== String(a.only).toLowerCase()) continue;
    const target = targets.find((t) => t.handle.toLowerCase() === line.handle.toLowerCase()) ?? null;
    const knowledge = knowledgeMap[String(line.lineNo)] ?? knowledgeMap[line.handle] ?? null;
    const elig = quoteEligibility({ line, target, knowledge, config });
    const base = {
      lineNo: line.lineNo,
      handle: line.handle,
      postUrl: line.postUrl,
      targetPostId: line.targetPostId,
      postedAtJst: line.postedAtJst,
      target: target ? { id: target.id, handle: target.handle, type: target.type, priority: target.priority ?? null, status: target.status } : null,
      knowledge: knowledge ? { content_id: knowledge.content_id, floor_code: knowledge.floor_code, title: knowledge.title, date: knowledge.date, volume: knowledge.volume, fetched_at: knowledge.fetched_at } : null,
      eligibility: elig,
      quoteKey: quoteKeyFor(line.handle, now),
      url: null,
      http: null,
      warnings: [...(line.warnings ?? [])],
      status: null,
      drafts: {},
      usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, calls: 0 },
    };
    if (!elig.eligible) {
      base.status = `対象外（${elig.reasons.join("／")}）`;
      items.push(base);
      continue;
    }
    const stop = checkQuoteStop({ line, target, replies, now });
    if (stop && !dryRun) {
      base.status = stop;
      items.push(base);
      continue;
    }
    if (stop) base.warnings.push(`dry-run: 停止判定を無効化して生成（本来は ${stop}）`);
    const hk = line.handle.toLowerCase();
    if (presentedHandles.has(hk)) {
      base.status = "停止（同日同ハンドルの引用 2 件目・本バッチ内）";
      items.push(base);
      continue;
    }
    if (presented >= maxPerRun) {
      base.status = `提示上限外（本日の上限 ${qcfg.max_per_day ?? 2}・記録済み ${recordedToday} 件・本 run の提示 ${maxPerRun} 件）`;
      items.push(base);
      continue;
    }
    base.url = buildWorksUrl({ floor: elig.floor, contentId: elig.contentId, handle: line.handle });
    if (!noHttp) {
      base.http = await checkWorksUrl(base.url, { fetchImpl });
      if (!base.http.ok) {
        base.status = `停止（works ページが HTTP ${base.http.status ?? base.http.error}・提示しない）`;
        items.push(base);
        continue;
      }
    } else base.http = { status: null, ok: null, skipped: true };
    if (target?.priority === 3) base.warnings.push("priority 3（対照用）: 案の提示は週 2 件まで（リプと合算・CSO 連絡 2026-09-19 22:2x）");
    process.stderr.write(`[quote] line ${line.lineNo} @${line.handle} cid=${elig.contentId} http=${base.http.status ?? "skip"} ...\n`);
    const r = await generateQuoteForLine({ line, target, knowledge, url: base.url, now, system, gen, maxRegen, config });
    Object.assign(base, { drafts: r.drafts, usage: r.usage, status: r.status });
    base.warnings.push(...r.warnings);
    process.stderr.write(`[quote]   → ${r.status} (calls=${r.usage.calls} in=${r.usage.input_tokens} out=${r.usage.output_tokens})\n`);
    if (!/^生成不能/.test(r.status)) {
      presented++;
      presentedHandles.add(hk);
    }
    items.push(base);
  }
  const out = {
    kind: "quote",
    generated_at: new Date().toISOString(),
    today_jst: jstYmd(now),
    model: a.stub ? "stub" : model,
    dry_run: dryRun,
    system_prompt_sha256: (await import("node:crypto")).createHash("sha256").update(system).digest("hex"),
    limits: { max_per_run: maxPerRun, max_per_day: qcfg.max_per_day ?? 2, recorded_today: recordedToday, note: "works ページへのリンク投稿は T1改（21:00・1 件）と合わせて 1 日 3 件まで／同一投稿にリプ＋引用の両方はしない" },
    counts: { lines: items.length, generated: items.filter((i) => i.status === "generated").length, presented, not_eligible: items.filter((i) => /^対象外/.test(i.status ?? "")).length },
    items,
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  if (a.out) {
    fs.writeFileSync(a.out, text);
    process.stderr.write(`[quote] wrote ${a.out}\n`);
  } else process.stdout.write(text);
  return out;
}

if (isMain(import.meta.url)) {
  main().catch((e) => {
    process.stderr.write(`[quote] ERROR ${e.message}\n`);
    process.exitCode = 1;
  });
}
