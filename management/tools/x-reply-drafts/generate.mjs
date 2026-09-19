// 束2 リプ案生成ツール — 生成オーケストレータ（ローカル CLI・裁定 A）
// 入力: parse.mjs の出力 / x_targets（MCP 読み戻し）/ x_replies（MCP 読み戻し）/ 作品知識（knowledge.mjs --extract）
// 生成: Anthropic Messages API（fetch・SDK 依存なし）。API キーは環境変数 ANTHROPIC_API_KEY を読むだけで、出力・ログに載せない。
// 出力: drafts JSON（案 A/B/C ＋ ガード結果 ＋ reply_key ＋ 停止理由）。Airtable / Supabase には触れない。
//
//   node --env-file=app-concierge/.env.local management/tools/x-reply-drafts/generate.mjs \
//     --parsed parsed.json --targets targets.json [--replies replies.json] [--knowledge knowledge.json] \
//     [--out drafts.json] [--today 2026-09-18] [--only handle] [--max-regen 2] [--model claude-opus-5] [--stub stub.json] [--dry-run]
//
// --dry-run: 停止判定（裁定 G・記録済み・対象外）を無効化して生成だけ行う。出力に dry_run=true が付き、record.mjs は記録 payload を作らない。
//
// --stub: node:test 用。API を呼ばずファイルの応答を返す（本番テーブルにも API にも触れない dry-run・裁定 H）。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMain } from "./parse.mjs";
import { guardReply, loadConfig, hintTokens, applyReplacements } from "./guards.mjs";
import { FIELDS, replyKeyFor, jstYmd } from "./record.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_MODEL = "claude-opus-5";
export const API_URL = "https://api.anthropic.com/v1/messages";

/** PROMPT.md の `## SYSTEM` 以下を system プロンプトとして取り出す。 */
export function loadSystemPrompt(file = path.join(HERE, "PROMPT.md")) {
  const md = fs.readFileSync(file, "utf8");
  const i = md.indexOf("\n## SYSTEM");
  if (i < 0) throw new Error("PROMPT.md に ## SYSTEM が無い");
  return md.slice(i + "\n## SYSTEM".length).trim();
}

// ---------- 入力の正規化（MCP の生出力 / 簡略形の両方を受ける） ----------

const cellName = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v.name ?? null : v ?? null);
const cellNames = (v) => (Array.isArray(v) ? v.map(cellName).filter(Boolean) : v ? [cellName(v)] : []);

export function normalizeTargets(raw) {
  const F = FIELDS.x_targets.fields;
  const recs = Array.isArray(raw) ? raw : raw?.records ?? [];
  return recs.map((r) => {
    if (r.cellValuesByFieldId) {
      const c = r.cellValuesByFieldId;
      return {
        id: r.id,
        handle: String(c[F.handle] ?? "").replace(/^@/, ""),
        display_name: c[F.display_name] ?? null,
        type: cellName(c[F.type]),
        genres: cellNames(c[F.genres]),
        note: c[F.note] ?? null,
        status: cellName(c[F.status]),
        reply_restriction: cellName(c[F.reply_restriction]),
        no_repropose: !!c[F.no_repropose],
        last_reply_at: c[F.last_reply_at] ?? null,
        priority: c[F.priority] ?? null,
      };
    }
    const f = r.fields ?? r;
    return {
      id: r.id ?? f.id ?? null,
      handle: String(f.handle ?? "").replace(/^@/, ""),
      display_name: f.display_name ?? null,
      type: cellName(f.type),
      genres: cellNames(f.genres),
      note: f.note ?? null,
      status: cellName(f.status),
      reply_restriction: cellName(f.reply_restriction),
      no_repropose: !!f.no_repropose,
      last_reply_at: f.last_reply_at ?? null,
      priority: f.priority ?? null,
    };
  });
}

export function normalizeReplies(raw) {
  const F = FIELDS.x_replies.fields;
  const recs = Array.isArray(raw) ? raw : raw?.records ?? [];
  return recs.map((r) => {
    if (r.cellValuesByFieldId) {
      const c = r.cellValuesByFieldId;
      return { id: r.id, reply_key: c[F.reply_key] ?? null, target_post_url: c[F.target_post_url] ?? null, posted_at: c[F.posted_at] ?? null };
    }
    const f = r.fields ?? r;
    return { id: r.id ?? null, reply_key: f.reply_key ?? null, target_post_url: f.target_post_url ?? null, posted_at: f.posted_at ?? null };
  });
}

/** JST の暦日差（last → now）。3 未満なら「3 日以内」（§26-9「本日の対象」＝3 日以上前）。 */
export function jstDayDiff(lastIso, now) {
  const d = (x) => Math.floor((new Date(x).getTime() + 9 * 3600 * 1000) / 86400000);
  return d(now) - d(lastIso);
}

const normUrl = (u) => String(u ?? "").trim().replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, "x.com/").replace(/[?#].*$/, "").replace(/\/$/, "");

/** 裁定 G と dedupe: 生成してよいかを判定する。 */
/** 再返信間隔（日・JST 暦日差）。CSO判定 2026-09-19: 女優本人 3 日／それ以外（メーカー公式・セール告知系・レビュー系）1 日。config で変更可。 */
export function replyIntervalDays(target, config) {
  const tbl = config?.reply_interval_days ?? { 女優本人: 3, default: 1 };
  const t = target?.type;
  return t && tbl[t] != null ? tbl[t] : tbl.default ?? 1;
}

/** 裁定 G と dedupe: 生成してよいかを判定する。同一投稿には 1 回のみ・同日同ハンドルは 1 件のみ・間隔は type 別。 */
export function checkStop({ line, target, replies, now, config }) {
  if (target?.no_repropose) return "対象外（no_repropose）";
  if (target?.reply_restriction === "あり") return "対象外（reply_restriction=あり）";
  const key = replyKeyFor(line.handle, now);
  if (replies.some((r) => r.reply_key === key)) return `停止（同日同ハンドル 2 件目: ${key} が既存）`;
  const dup = replies.find((r) => normUrl(r.target_post_url) === normUrl(line.postUrl));
  if (dup) return `停止（記録済み: 同じ target_post_url が ${dup.reply_key ?? dup.id} に存在）`;
  if (target?.last_reply_at) {
    const diff = jstDayDiff(target.last_reply_at, now);
    const min = replyIntervalDays(target, config);
    if (diff < min) return `停止（再返信間隔 ${min} 日未満: last_reply_at=${target.last_reply_at}・${diff} 日前・type=${target.type ?? "?"}）`;
  }
  return null;
}

// ---------- API ----------

function schemaFor(types) {
  return {
    type: "object",
    properties: Object.fromEntries(types.map((t) => [t, { type: "string" }])),
    required: types,
    additionalProperties: false,
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Anthropic Messages API を fetch で呼ぶ。キーは env からのみ読み、出力に載せない。 */
export async function callAnthropic({ system, user, types, model = DEFAULT_MODEL, apiKey = process.env.ANTHROPIC_API_KEY, timeoutMs = 120_000 }) {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY が環境変数に無い（--env-file=app-concierge/.env.local）");
  const body = {
    model,
    max_tokens: 4096,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema: schemaFor(types) } },
    messages: [{ role: "user", content: user }],
  };
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        let info = text.slice(0, 300);
        try {
          const j = JSON.parse(text);
          info = `${j.error?.type ?? "?"}: ${j.error?.message ?? ""}`;
        } catch {}
        const retryable = res.status === 429 || res.status === 529 || res.status >= 500;
        lastErr = new Error(`API ${res.status} ${info}`);
        if (retryable && attempt < 2) {
          await sleep(2000 * (attempt + 1));
          continue;
        }
        throw lastErr;
      }
      const json = JSON.parse(text);
      const block = (json.content ?? []).find((b) => b.type === "text");
      return { stop_reason: json.stop_reason, stop_details: json.stop_details ?? null, text: block?.text ?? "", usage: json.usage ?? null, model: json.model };
    } catch (e) {
      lastErr = e;
      if (e.name === "AbortError" && attempt < 2) continue;
      if (e.name === "AbortError") throw new Error(`API timeout ${timeoutMs}ms`);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error("API 失敗");
}

/** --stub: types ごとに固定文字列を返す（テスト用・ネットワークなし）。 */
export function stubGenerator(stub) {
  let call = 0;
  return async ({ types }) => {
    const entry = Array.isArray(stub) ? stub[Math.min(call, stub.length - 1)] : stub;
    call++;
    const obj = Object.fromEntries(types.map((t) => [t, entry?.[t] ?? ""]));
    return { stop_reason: "end_turn", text: JSON.stringify(obj), usage: { input_tokens: 0, output_tokens: 0 }, model: "stub" };
  };
}

// ---------- 1 行の生成 ----------

function userPayload({ line, target, knowledge, todayJst, retryReasons, config }) {
  const p = {
    target: target ? { handle: target.handle, display_name: target.display_name, type: target.type, genres: target.genres, note: target.note } : { handle: line.handle, display_name: null, type: null, genres: [], note: "（台帳未登録）" },
    post: { posted_at_jst: line.postedAtJst, body: line.body },
    knowledge: knowledge ?? null,
    today_jst: todayJst,
  };
  // R14 の機械検査と同じ抽出で「本文の具体候補」を渡す（数値・日付・企画名・順位のいずれかを 1 つ含める・CSO判定 2026-09-19）
  p.hints = { concretes_from_body: hintTokens(line.body, config?.R14_concreteness ?? {}, config?.R6_appearance_explicit ?? []) };
  if (retryReasons) p.retry_reasons = retryReasons;
  return JSON.stringify(p, null, 2);
}

export async function generateForLine({ line, target, knowledge, replies, now, system, gen, maxRegen = 2, config, dryRun = false }) {
  const todayJst = jstYmd(now).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  const item = {
    lineNo: line.lineNo,
    handle: line.handle,
    postUrl: line.postUrl,
    targetPostId: line.targetPostId,
    postedAtJst: line.postedAtJst,
    target: target ? { id: target.id, handle: target.handle, type: target.type, priority: target.priority ?? null, status: target.status, last_reply_at: target.last_reply_at } : null,
    knowledgeMode: knowledge ? "cache" : "none",
    types: knowledge ? ["A", "B", "C"] : ["A", "C"], // B は知識ありモードのみ（CSO判定 2026-09-19 dry-run #3）
    knowledge: knowledge ? { content_id: knowledge.content_id, title: knowledge.title, fetched_at: knowledge.fetched_at } : null,
    replyKey: replyKeyFor(line.handle, now),
    warnings: [...(line.warnings ?? [])],
    status: null,
    drafts: {},
    usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, calls: 0 },
  };
  if (!target) item.warnings.push("台帳未登録（x_targets に handle が無い・生成は続行・登録は HUMAN）");
  // priority 3 は対照用＝抽出には含めるが案の提示は週 2 件まで（CSO 連絡 2026-09-19 22:2x）。件数管理は HUMAN／CTO の運用側で行う。
  if (target?.priority === 3) item.warnings.push("priority 3（対照用）: 案の提示は週 2 件まで（CSO 連絡 2026-09-19 22:2x）");
  const stop = checkStop({ line, target, replies, now, config });
  if (stop && !dryRun) {
    item.status = stop;
    return item;
  }
  if (stop) item.warnings.push(`dry-run: 停止判定を無効化して生成（本来は ${stop}）`);

  const names = [...(knowledge?.actress ?? [])];
  if (target?.type === "女優本人" && target.display_name) names.push(target.display_name);
  // メーカー・レーベル名（女優本人以外の display_name・作品知識の maker/label）には「さん」を付けない（R7・CSO判定 2026-09-19）
  const orgNames = [...(knowledge?.maker ?? []), ...(knowledge?.label ?? [])];
  if (target && target.type !== "女優本人" && target.display_name) orgNames.push(target.display_name);
  const sources = [line.body, knowledge ? JSON.stringify(knowledge) : ""];
  let pending = [...item.types];
  let retryReasons = null;
  for (let attempt = 0; attempt <= maxRegen && pending.length; attempt++) {
    const r = await gen({ system, user: userPayload({ line, target, knowledge, todayJst, retryReasons, config }), types: pending });
    item.usage.calls++;
    item.usage.input_tokens += r.usage?.input_tokens ?? 0;
    item.usage.output_tokens += r.usage?.output_tokens ?? 0;
    item.usage.cache_creation_input_tokens += r.usage?.cache_creation_input_tokens ?? 0;
    item.usage.cache_read_input_tokens += r.usage?.cache_read_input_tokens ?? 0;
    if (r.stop_reason === "refusal") {
      item.status = `生成不能（refusal: ${r.stop_details?.category ?? "?"}）`;
      return item;
    }
    let obj;
    try {
      obj = JSON.parse(r.text);
    } catch {
      item.warnings.push(`attempt ${attempt + 1}: 応答が JSON でない（stop_reason=${r.stop_reason}）`);
      retryReasons = { all: "前回の応答が JSON として解釈できなかった" };
      continue;
    }
    const nextReasons = {};
    const nextPending = [];
    for (const t of pending) {
      // R18 語置換（「体験版」→「サンプル動画」・CSO判定 2026-09-19 12:1x）はガードの前に適用し、置換した語を記録する
      const rep = applyReplacements(String(obj[t] ?? "").trim(), config);
      const text = rep.text;
      const g = guardReply(text, { type: t, names, orgNames, sources, body: line.body, knowledge, targetType: target?.type ?? null, displayName: target?.display_name ?? null, config });
      // ガード NG だった過去の案は history に残す（CSO が再生成の理由を追えるように）
      const history = [...(item.drafts[t]?.history ?? [])];
      if (item.drafts[t] && !item.drafts[t].guard.ok) history.push({ text: item.drafts[t].text, failures: item.drafts[t].guard.failures });
      item.drafts[t] = { text, guard: g, attempts: (item.drafts[t]?.attempts ?? 0) + 1, history, ...(rep.applied.length ? { replacements: rep.applied } : {}) };
      if (!g.ok) {
        nextPending.push(t);
        nextReasons[t] = g.failures.map((f) => `${f.rule}: ${f.detail}`).join(" / ");
      }
    }
    pending = nextPending;
    retryReasons = pending.length ? nextReasons : null;
  }
  const ng = item.types.filter((t) => !item.drafts[t]?.guard?.ok);
  item.status = ng.length ? `一部生成不能（${ng.join("/")} がガード未通過・最大 ${maxRegen} 回再生成後）` : "generated";
  return item;
}

// ---------- CLI ----------

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

export async function main(argv = process.argv.slice(2)) {
  const a = parseArgs(argv);
  if (!a.parsed || !a.targets) {
    process.stderr.write("usage: generate.mjs --parsed parsed.json --targets targets.json [--replies replies.json] [--knowledge knowledge.json] [--out drafts.json] [--today YYYY-MM-DD] [--only handle] [--max-regen 2] [--model id] [--stub stub.json]\n");
    process.exit(2);
  }
  const parsed = JSON.parse(fs.readFileSync(a.parsed, "utf8"));
  const targets = normalizeTargets(JSON.parse(fs.readFileSync(a.targets, "utf8")));
  const replies = a.replies ? normalizeReplies(JSON.parse(fs.readFileSync(a.replies, "utf8"))) : [];
  const knowledgeMap = a.knowledge ? JSON.parse(fs.readFileSync(a.knowledge, "utf8")) : {};
  const now = a.today ? new Date(`${a.today}T12:00:00+09:00`) : new Date();
  const system = loadSystemPrompt();
  const model = a.model ?? DEFAULT_MODEL;
  const gen = a.stub ? stubGenerator(JSON.parse(fs.readFileSync(a.stub, "utf8"))) : (args) => callAnthropic({ ...args, model });
  const maxRegen = a["max-regen"] != null ? Number(a["max-regen"]) : 2;
  const config = loadConfig();
  const dryRun = a["dry-run"] === true;

  const items = [];
  // 同日同ハンドルは 1 件のみ（checkStop は x_replies の既存行しか見ないため、同一バッチ内の 2 行目以降はここで止める・API を呼ばない）。
  // 入力の並び順＝優先順（先に書いた行を生成する）。全行を生成したいときは --all-lines。
  const generatedHandles = new Map();
  for (const line of parsed.lines ?? []) {
    if (!line.ok) {
      items.push({ lineNo: line.lineNo, status: `解析不能: ${line.error}`, warnings: line.warnings ?? [] });
      continue;
    }
    if (a.only && line.handle.toLowerCase() !== String(a.only).toLowerCase()) continue;
    const target = targets.find((t) => t.handle.toLowerCase() === line.handle.toLowerCase()) ?? null;
    const knowledge = knowledgeMap[String(line.lineNo)] ?? knowledgeMap[line.handle] ?? null;
    const hk = line.handle.toLowerCase();
    if (!a["all-lines"] && generatedHandles.has(hk)) {
      items.push({
        lineNo: line.lineNo, handle: line.handle, postUrl: line.postUrl, targetPostId: line.targetPostId, postedAtJst: line.postedAtJst,
        target: target ? { id: target.id, handle: target.handle, type: target.type, priority: target.priority ?? null, status: target.status, last_reply_at: target.last_reply_at } : null,
        knowledgeMode: knowledge ? "cache" : "none", replyKey: replyKeyFor(line.handle, now), warnings: [...(line.warnings ?? [])],
        status: `停止（同日同ハンドル 2 件目: 本バッチ内 ${generatedHandles.get(hk)} 行目を優先・投稿は 1 日 1 件。別の行を優先するなら入力順を入れ替えるか --all-lines）`,
        drafts: {}, usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, calls: 0 },
      });
      process.stderr.write(`[generate] line ${line.lineNo} @${line.handle} → 停止（同日同ハンドル 2 件目・本バッチ内）\n`);
      continue;
    }
    process.stderr.write(`[generate] line ${line.lineNo} @${line.handle} knowledge=${knowledge ? "cache" : "none"} ...\n`);
    const item = await generateForLine({ line, target, knowledge, replies, now, system, gen, maxRegen, config, dryRun });
    if (!/^(停止|対象外|生成不能)/.test(String(item.status ?? ""))) generatedHandles.set(hk, line.lineNo);
    process.stderr.write(`[generate]   → ${item.status} (calls=${item.usage?.calls ?? 0} in=${item.usage?.input_tokens ?? 0} out=${item.usage?.output_tokens ?? 0})\n`);
    items.push(item);
  }
  const out = {
    generated_at: new Date().toISOString(),
    today_jst: jstYmd(now),
    model: a.stub ? "stub" : model,
    dry_run: dryRun,
    system_prompt_sha256: (await import("node:crypto")).createHash("sha256").update(system).digest("hex"),
    counts: { lines: items.length, generated: items.filter((i) => i.status === "generated").length, stopped: items.filter((i) => i.status && i.status !== "generated").length },
    items,
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  if (a.out) {
    fs.writeFileSync(a.out, text);
    process.stderr.write(`[generate] wrote ${a.out}\n`);
  } else process.stdout.write(text);
  return out;
}

if (isMain(import.meta.url)) {
  main().catch((e) => {
    process.stderr.write(`[generate] ERROR ${e.message}\n`);
    process.exitCode = 1; // process.exit() は Windows の undici ソケット後始末で libuv assertion を出すため使わない
  });
}
