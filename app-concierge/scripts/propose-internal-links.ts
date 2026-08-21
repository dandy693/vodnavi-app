/**
 * B2②-b: articles 間の内部リンクを AI に提案させ、`internal_links` へ
 * `origin='ai'` / `status='proposed'` で INSERT する提案バッチ。
 *
 * 【設計の前提（FACT_GOVERNANCE §12）】
 *  - 本スクリプトのプロセスが `status='live'` に到達する経路は存在しない。
 *    保証しているのは ①`ai_proposer` に UPDATE/DELETE の GRANT を出さないこと
 *    ②RLS `with check (origin='ai' and status='proposed' and approved_at is null
 *    and approved_by is null)` ③トリガ3種 —— の3点であって、本ファイルの
 *    コードではない。**コードを書き換えても DB 側は突破できない。**
 *  - **`link_approver` の鍵を本スクリプトに渡さないこと。** 承認は Airtable 経由で
 *    人間が行う（HUMAN_INTERVENTION_LOG 分類C）。
 *  - LLM は資格情報を持たない。**LLM の出力が SQL になることはない。**
 *    JSON を受け取り、本スクリプトが検証してから PostgREST で INSERT する。
 *
 * 【実行】
 *   node --env-file=.env.local scripts/propose-internal-links.ts            # dry-run（既定）
 *   node --env-file=.env.local scripts/propose-internal-links.ts --apply    # 実 INSERT
 *   node --env-file=.env.local scripts/propose-internal-links.ts --input p.json --apply
 *
 * 【必要な環境変数】
 *   SUPABASE_URL                  … プロジェクト URL
 *   SUPABASE_ANON_KEY             … 読み取り用（`editorial_articles` の published のみ
 *                                   読める。RLS ポリシー `anon_select_published_editorial_articles`）
 *   SUPABASE_AI_PROPOSER_KEY      … **書き込み用**。`role: ai_proposer` を持つ JWT。
 *                                   `ai_proposer` は nologin のため直接接続はできず、
 *                                   PostgREST が JWT の role クレームで `set local role` する。
 *   ANTHROPIC_API_KEY             … `--input` を使わない場合のみ必要
 *   INTERNAL_LINKS_MODEL          … 省略時は台帳既定値（下記 DEFAULT_MODEL）
 *
 * 【読み戻し検算について（§10）】
 *   `ai_proposer` には **SELECT ポリシーが無い**（実測 2026-08-18）。したがって
 *   本スクリプト単体では INSERT 後の読み戻しができない。`SUPABASE_LINK_APPROVER_KEY`
 *   が与えられた場合のみ読み戻す。**与えられない場合は「検算していない」と明示して終了する。**
 *   （鍵を渡すかは運用判断。渡すと本プロセスが SELECT できるようになるだけで、
 *     UPDATE は列単位 GRANT と RLS により `status` 系のみに限定される。）
 */

type Article = { slug: string; title: string; body: string };
type Proposal = {
  source_slug: string;
  target_slug: string;
  anchor_text: string;
  position: "fv" | "body" | "footer";
  reason: string;
};

/** 台帳（TASK_BOARD L3378）が定めたモデル。実行前に実在を確認すること。 */
const DEFAULT_MODEL = "claude-sonnet-4-6";
/** §11「AI の提案量は、人間が承認できる量を超えてはならない」による初期スコープ。 */
const MAX_LINKS_PER_SOURCE = 3;
const MAX_TOTAL = 24;
const ANCHOR_MIN = 4;
const ANCHOR_MAX = 80;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const INPUT = argValue("--input");

function argValue(name: string): string | null {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `環境変数 ${name} が未設定。値は出力しない。--env-file=.env.local を付けたか確認すること。`,
    );
  }
  return v;
}

// ── 読み取り: 公開済み記事（anon キー。published のみ RLS で見える） ──────────

async function fetchPublishedArticles(): Promise<Article[]> {
  const url = need("SUPABASE_URL").replace(/\/$/, "");
  const key = need("SUPABASE_ANON_KEY");
  const res = await fetch(
    `${url}/rest/v1/editorial_articles?select=slug,title,body&publish_status=eq.published&order=slug`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) {
    throw new Error(`記事の取得に失敗: HTTP ${res.status}（本文は出力しない）`);
  }
  return (await res.json()) as Article[];
}

// ── 提案の生成（LLM は JSON を返す関数として扱う） ──────────────────────────

function buildPrompt(articles: Article[]): string {
  const list = articles
    .map((a) => `- slug: ${a.slug}\n  title: ${a.title}\n  本文冒頭: ${a.body.slice(0, 300)}`)
    .join("\n");
  return [
    "あなたは日本語メディアの編集者です。以下は公開済み記事の一覧です。",
    "記事どうしを結ぶ内部リンクを提案してください。",
    "",
    list,
    "",
    "制約:",
    `- 1記事あたりの発リンクは最大 ${MAX_LINKS_PER_SOURCE} 本。全体で最大 ${MAX_TOTAL} 本。`,
    "- source_slug と target_slug は上の一覧にある slug のみ。自分自身へは張らない。",
    `- anchor_text は日本語の自然文で ${ANCHOR_MIN}〜${ANCHOR_MAX} 文字。`,
    "  「こちら」「詳細はこちら」「リンク」等の指示語だけのアンカーは禁止。",
    "  リンク先の内容が分かる語を含めること。",
    "- URL・af_id・DMM のドメイン名をアンカーに含めない。",
    "- 同じ (source_slug, target_slug) の組を重複させない。",
    "- position は 'body' を既定とし、記事末尾なら 'footer'。",
    "",
    "出力は次の形の JSON 配列のみ。前置きも説明も付けないこと。",
    '[{"source_slug":"…","target_slug":"…","anchor_text":"…","position":"body","reason":"…"}]',
  ].join("\n");
}

async function generateProposals(articles: Article[]): Promise<Proposal[]> {
  const model = process.env.INTERNAL_LINKS_MODEL ?? DEFAULT_MODEL;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": need("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: "user", content: buildPrompt(articles) }],
    }),
  });
  if (!res.ok) {
    // 本文にはキーが含まれないが、念のため種別のみを出す
    throw new Error(`LLM 呼び出しに失敗: HTTP ${res.status} model=${model}`);
  }
  const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = (json.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) throw new Error("LLM の出力から JSON 配列を取り出せなかった");
  return JSON.parse(m[0]) as Proposal[];
}

// ── ガードレール（DB 側と同じ検査をバッチ側でも行う。DB が最終防衛線） ────────

const AFFILIATE_RE = /(https?:\/\/|af_id|dmm\.co\.jp|al\.dmm|moterist-99[0-9])/i;
const STOPWORD_RE = /^\s*(こちら|ここ|詳細|詳しくはこちら|詳細はこちら|リンク|click here|here|link)\s*$/i;
const SLUG_RE = /^[a-z0-9-]+$/;
const POSITIONS = new Set(["fv", "body", "footer"]);

type Checked = { ok: Proposal[]; rejected: Array<{ p: Proposal; why: string }> };

function applyGuardrails(proposals: Proposal[], published: Set<string>): Checked {
  const ok: Proposal[] = [];
  const rejected: Array<{ p: Proposal; why: string }> = [];
  const perSource = new Map<string, number>();
  const seen = new Set<string>();

  for (const p of proposals) {
    const why = (() => {
      // G1 公開済み slug のホワイトリスト完全一致（DB: GUARD_WHITELIST）
      if (!published.has(p.source_slug)) return "G1 source_slug が公開済みでない";
      if (!published.has(p.target_slug)) return "G1 target_slug が公開済みでない";
      if (!SLUG_RE.test(p.target_slug)) return "G1 target_slug の形式が不正";
      // 自己リンク（DB: chk_no_self_link）。
      // **2026-08-18 時点では DB 側に制約が無く 201 で通った**ため本バッチ側で落としていた。
      // **2026-08-21（第82便・第70便 CSO裁定(3)）に `chk_no_self_link` を追加済**
      // （`not (source_type='article' and source_id = target_slug)`・陰性/陽性とも実測確認）。
      // バッチ側のこの判定は残す —— DB エラーではなく理由付きで棄却するため。
      if (p.source_slug === p.target_slug) return "自己リンク";
      // G2 外部URL・af_id・DMM ドメイン（DB: chk_no_external_or_affiliate）
      if (AFFILIATE_RE.test(p.anchor_text)) return "G2 アンカーに外部URL/af_id/DMM ドメイン";
      if (/moterist-99[0-9]/i.test(p.target_slug)) return "G2 target_slug に af_id";
      // G5 アンカーは自然文（DB: chk_anchor_natural）
      const len = [...p.anchor_text].length;
      if (len < ANCHOR_MIN || len > ANCHOR_MAX) return `G5 アンカー長 ${len} が範囲外`;
      if (STOPWORD_RE.test(p.anchor_text)) return "G5 アンカーが指示語のみ";
      // G4 同一 (source, target) の重複禁止（DB: ux_internal_links_src_tgt）
      const key = `${p.source_slug} ${p.target_slug}`;
      if (seen.has(key)) return "G4 同一 (source,target) の重複";
      // G3 1記事あたりの発リンク上限（DB: GUARD_MAX3）
      if ((perSource.get(p.source_slug) ?? 0) >= MAX_LINKS_PER_SOURCE) {
        return `G3 発リンクが上限 ${MAX_LINKS_PER_SOURCE} 本を超える`;
      }
      // position
      if (!POSITIONS.has(p.position)) return "position が不正";
      // 全体上限（§11 承認可能量）
      if (ok.length >= MAX_TOTAL) return `全体上限 ${MAX_TOTAL} 本を超える`;
      return null;
    })();

    if (why) {
      rejected.push({ p, why });
      continue;
    }
    seen.add(`${p.source_slug} ${p.target_slug}`);
    perSource.set(p.source_slug, (perSource.get(p.source_slug) ?? 0) + 1);
    ok.push(p);
  }
  return { ok, rejected };
}

// ── 書き込み: ai_proposer の JWT で INSERT のみ ────────────────────────────

async function insertProposals(rows: Proposal[]): Promise<void> {
  const url = need("SUPABASE_URL").replace(/\/$/, "");
  const key = need("SUPABASE_AI_PROPOSER_KEY");
  // G6: status / approved_at / approved_by は **一切送らない**。
  // 既定値 'proposed' と NULL に委ねる。RLS の with check とトリガが最終防衛線。
  const payload = rows.map((p) => ({
    source_type: "article",
    source_id: p.source_slug,
    target_slug: p.target_slug,
    anchor_text: p.anchor_text,
    position: p.position,
    origin: "ai",
  }));
  const res = await fetch(`${url}/rest/v1/internal_links`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`INSERT に失敗: HTTP ${res.status} ${await res.text()}`);
  }
}

/** §10: 書き込み系の戻り値は着地の証拠にならない。必ず対象側を読み戻す。 */
async function readBack(expected: number): Promise<void> {
  const approverKey = process.env.SUPABASE_LINK_APPROVER_KEY;
  if (!approverKey) {
    console.warn(
      "[検算していない] `ai_proposer` には SELECT ポリシーが無いため本プロセスでは読み戻せない。" +
        "SUPABASE_LINK_APPROVER_KEY が与えられていないため §10 の検算を実行していない。" +
        "別経路で `select count(*) from internal_links where status='proposed'` を確認すること。",
    );
    return;
  }
  const url = need("SUPABASE_URL").replace(/\/$/, "");
  const res = await fetch(
    `${url}/rest/v1/internal_links?select=source_id,target_slug,status,origin,approved_at,approved_by&status=eq.proposed`,
    { headers: { apikey: approverKey, Authorization: `Bearer ${approverKey}` } },
  );
  if (!res.ok) throw new Error(`読み戻しに失敗: HTTP ${res.status}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  const bad = rows.filter(
    (r) => r.status !== "proposed" || r.origin !== "ai" || r.approved_at !== null || r.approved_by !== null,
  );
  console.log(`[検算] status='proposed' の行数 = ${rows.length}（今回の INSERT は ${expected} 行）`);
  if (bad.length) {
    throw new Error(`[検算] 想定外の行が ${bad.length} 件ある。status/origin/approved_* を確認すること。`);
  }
  console.log("[検算] status / origin / approved_at / approved_by はすべて想定どおり。");
}

// ── main ───────────────────────────────────────────────────────────────────

async function main() {
  const articles = await fetchPublishedArticles();
  const published = new Set(articles.map((a) => a.slug));
  console.log(`公開済み記事: ${articles.length}本`);

  const raw: Proposal[] = INPUT
    ? JSON.parse(await (await import("node:fs/promises")).readFile(INPUT, "utf8"))
    : await generateProposals(articles);
  console.log(`提案（検証前）: ${raw.length}件`);

  const { ok, rejected } = applyGuardrails(raw, published);
  for (const r of rejected) {
    console.log(`  [reject] ${r.p.source_slug} → ${r.p.target_slug} :: ${r.why}`);
  }
  console.log(`ガードレール通過: ${ok.length}件 / 却下: ${rejected.length}件`);
  for (const p of ok) {
    console.log(`  [ok] ${p.source_slug} → ${p.target_slug} :: 「${p.anchor_text}」(${p.position})`);
  }

  if (!APPLY) {
    console.log("\n--apply が無いため INSERT していない（dry-run）。");
    return;
  }
  if (ok.length === 0) {
    console.log("\n通過した提案が0件のため INSERT しない。");
    return;
  }
  await insertProposals(ok);
  console.log(`\nINSERT 送信: ${ok.length}行（status は送っていない＝既定値 'proposed'）`);
  await readBack(ok.length);
}

main().catch((e) => {
  console.error(`失敗: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
