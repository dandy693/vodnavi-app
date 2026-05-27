/**
 * CCO 自動レビュー注入パイプライン — モックアップ実装。
 *
 * STRATEGY_BRIEF: 2026-05-27 物理監査で確認された app.vodnavi.jp の検索直撃
 * TOP 10 品番に対し、BRAND_DESIGN_GUIDE.md 準拠の『ビブリア・エロティカ』仕様
 * 文学的官能レビューを **生成 → 自動配置** する。FANZA 公式あらすじの言い換え
 * ではなく、E-E-A-T を満たす VODNAVI 独自視座を Information Gain 段落として
 * 作品詳細ページ (server component) に SSR で焼き込む。
 *
 * パイプライン:
 *   1. CCO_TARGET_CIDS (scripts/cco-target-cids.ts) を入力に取る
 *   2. FANZA Webservice (fetchItemList) から作品メタを取得
 *   3. buildPromptMessages (scripts/cco-review-prompt.ts) でプロンプト構築
 *   4. mode === "live"  → @ai-sdk/openai + ai.generateText で本物のレビュー生成
 *      mode === "dry"   → buildFixtureReview で構造化フォールバックを返す
 *   5. レビュー本文 + frontmatter を src/data/work-reviews/{contentId}.md に配置
 *   6. 既存ファイルは --force でない限りスキップ
 *
 * 走らせ方:
 *   cd app-concierge
 *
 *   # dry-run (OPENAI_API_KEY 不要、構造的に通電するか確認):
 *   node --experimental-strip-types scripts/generate-work-reviews.ts --dry-run
 *
 *   # 単一 cid だけ再生成 (--force で既存上書き):
 *   node --experimental-strip-types scripts/generate-work-reviews.ts \
 *     --dry-run --target=gkok00002 --force
 *
 *   # LIVE (CCO 本番) — .env.local の OPENAI_API_KEY を OpenAI SDK が自動参照。
 *   #   モデルは OPENAI_REVIEW_MODEL (env) で上書き可、既定は gpt-4o。
 *   node --experimental-strip-types scripts/generate-work-reviews.ts \
 *     --mode=live --target=gkok00002 --force
 *
 * 終了コード:
 *   0  = 1 件以上配置 / 既存 fixture 維持
 *   1  = 致命的エラー (FANZA API 失敗 / I/O 失敗 / プロンプト構築失敗)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import type { DmmItem, DmmItemListResponse } from "../src/lib/fanza/types.ts";
import { FANZA_FLOORS } from "../src/lib/fanza/types.ts";

/**
 * Node 純正 strip-types は parameter property 非対応のため、
 * `src/lib/fanza/client.ts` (class FanzaApiError 等を含む) を直接 import できない。
 * スクリプト経路では FANZA Webservice を最小限 inline で叩く。
 *
 * このヘルパは page.tsx の SSR fetchItemList とは異なるパス。詳細ページの
 * ランタイム挙動には一切影響しない。
 */
const FANZA_BASE = "https://api.dmm.com/affiliate/v3/ItemList";

async function fetchItemListMinimal(params: {
  site: "FANZA";
  service?: string;
  floor?: string;
  cid?: string;
  hits?: number;
}): Promise<DmmItemListResponse> {
  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;
  if (!apiId || !affiliateId) {
    throw new Error(
      "DMM_API_ID / DMM_AFFILIATE_ID が .env.local に未設定です。",
    );
  }
  const url = new URL(FANZA_BASE);
  url.searchParams.set("api_id", apiId);
  url.searchParams.set("affiliate_id", affiliateId);
  url.searchParams.set("site", params.site);
  url.searchParams.set("output", "json");
  if (params.service) url.searchParams.set("service", params.service);
  if (params.floor) url.searchParams.set("floor", params.floor);
  if (params.cid) url.searchParams.set("cid", params.cid);
  if (params.hits != null) url.searchParams.set("hits", String(params.hits));

  const res = await fetch(url);
  if (!res.ok) {
    // DMM の 400 レスポンスは request parameters を JSON で echo する仕様のため、
    // api_id / affiliate_id 等の secret 値が body に含まれる。CTO 安全境界の
    // 観点でこれら secret は **絶対に** ログ出力させない。マスク後のみ emit。
    let detail = "";
    try {
      const raw = await res.text();
      const masked = maskDmmSecretsInString(raw);
      detail = ` body=${masked.slice(0, 400).replace(/\s+/g, " ")}`;
    } catch {
      // ignore
    }
    throw new Error(`FANZA API ${res.status} ${res.statusText}${detail}`);
  }
  return (await res.json()) as DmmItemListResponse;
}

/**
 * DMM 認証情報をログ文字列から消去する多段マスク。
 *
 * 一段目: JSON フィールド名ベースの正規表現マスク（`"api_id":"…"` 等）
 *   - DMM 標準の 400 echo フォーマットに対する一次防衛線
 *   - DMM が将来 response shape を変えても、フィールド名さえ "api_id" /
 *     "affiliate_id" のままなら通用する
 *
 * 二段目: process.env の実値リテラル reverse-mask
 *   - body の別フィールドに secret 値が偶発混入したケース (例: error message
 *     の自由文に key 値が echo される) でも、env 値そのものを literal として
 *     検索置換することで横展開を遮断する
 *   - 4 文字未満の空文字 / 短い値は false positive (全文字列破壊) のリスクが
 *     あるため、閾値ガード付きでスキップ
 *
 * すべての段は **置換後文字列** を引き渡し、最終出力には secret 原値が
 * 1 byte たりとも残らないことを構造的に担保する。
 */
function maskDmmSecretsInString(input: string): string {
  let s = input
    .replace(/"api_id":"[^"]*"/g, '"api_id":"[MASKED_DMM_CREDENTIAL]"')
    .replace(/"affiliate_id":"[^"]*"/g, '"affiliate_id":"[MASKED_DMM_CREDENTIAL]"');

  const apiId = process.env.DMM_API_ID;
  if (apiId && apiId.length >= 4) {
    s = s.split(apiId).join("[MASKED_DMM_CREDENTIAL]");
  }
  const affiliateId = process.env.DMM_AFFILIATE_ID;
  if (affiliateId && affiliateId.length >= 4) {
    s = s.split(affiliateId).join("[MASKED_DMM_CREDENTIAL]");
  }
  return s;
}

import { CCO_TARGET_CIDS, type CcoTargetCid } from "./cco-target-cids.ts";
import {
  PROMPT_VERSION,
  TARGET_MAX_CHARS,
  TARGET_MIN_CHARS,
  buildFixtureReview,
  buildPromptMessages,
} from "./cco-review-prompt.ts";

type RunMode = "dry" | "live";

type CliOptions = {
  mode: RunMode;
  force: boolean;
  targetCids: ReadonlyArray<string> | null;
};

function parseCli(argv: ReadonlyArray<string>): CliOptions {
  let mode: RunMode = "dry";
  let force = false;
  let targetCids: string[] | null = null;
  for (const raw of argv) {
    if (raw === "--dry-run" || raw === "--mode=dry") mode = "dry";
    else if (raw === "--mode=live") mode = "live";
    else if (raw === "--force") force = true;
    else if (raw.startsWith("--target=")) {
      const csv = raw.slice("--target=".length);
      targetCids = csv
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }
  return { mode, force, targetCids };
}

/**
 * 出力先 dir (`src/data/work-reviews/`) の絶対パスを ESM 経由で解決。
 * cwd 依存を避け、本ファイルからの相対オフセットだけで決める。
 */
function resolveReviewsDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "src", "data", "work-reviews");
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * ============================================================================
 * 全自動プロンプトサニタイザー（防壁マフラー）
 * ============================================================================
 *
 * STRATEGY_BRIEF (Sprint 2): TOP10 を超えた数百〜数千品番への水平展開時に、
 * FANZA メタ (タイトル / ジャンル / メーカー / 商品説明) に含まれる直接的な
 * 成人向け名詞が OpenAI の content policy フィルタを刺激し、
 * 400 Bad Request (content_policy_violation) でバッチが途中クラッシュする
 * リスクを構造的に排除する。
 *
 * 設計方針:
 *   - LLM 到達前段で、メタ文字列を「BRAND_DESIGN_GUIDE のサニタイズ表現規則」
 *     と同じ温度の抽象語へ置換する。完全削除ではなく置換を基本とし、文脈の
 *     繋がりを温存する（タイトルが意味不明な空所だらけになると CCO レビューの
 *     構造もぼやけるため）。
 *   - 置換語は『ビブリア・エロティカ』の文学的官能トーン（書斎 / バーテンダー
 *     語り）と整合するため、機械的な伏字 (○○) ではなく成熟した語彙を選ぶ。
 *   - 辞書は append-only。新しい刺激語が発見されたら **削除せず追加** することで、
 *     回帰テスト的に過去パターンに対しても継続適用される。
 *
 * 適用順序の鉄則:
 *   - 「より長いパターン」を先、「短いパターン」を後に並べる。短い語が長い語の
 *     部分一致を奪うと、結合語の置換漏れが発生するため。
 */

type SanitizeRule = readonly [pattern: RegExp, replacement: string];

const FANZA_SANITIZE_RULES: ReadonlyArray<SanitizeRule> = [
  // ---- 性器名・伏字バリエーション（長い順）-----------------------------
  [/マ[○〇*＊⚪\s]?コ/g, "秘処"],
  [/オ[○〇*＊⚪\s]?マ[○〇*＊⚪\s]?コ/g, "秘処"],
  [/オ[○〇*＊⚪\s]?コ/g, "秘処"],
  [/チ[○〇*＊⚪\s]?ンポ/g, "雄しべ"],
  [/チ[○〇*＊⚪\s]?ンコ/g, "雄しべ"],
  [/ち[○〇*＊⚪\s]?ぽ/g, "雄しべ"],
  [/おまんこ/g, "秘処"],
  [/おちんちん/g, "雄しべ"],

  // ---- 行為名（直接表現）-----------------------------------------------
  [/中出し/g, "深い抱擁"],
  [/イラマチオ/g, "口づけの儀"],
  [/ぶっかけ/g, "夜露"],
  [/ごっくん/g, "受容"],
  [/フェラチオ/g, "口唇の奉仕"],
  [/フェラ(?!ーリ)/g, "口唇の奉仕"], // フェラーリ等の誤爆を避ける
  [/手コキ/g, "繊細な愛撫"],
  [/騎乗位/g, "対峙の姿勢"],
  [/正常位/g, "向き合う姿勢"],
  [/バック/g, "背後からの抱擁"],
  [/アナル/g, "禁忌の境界"],

  // ---- 状態・体液名 ----------------------------------------------------
  [/潮吹き/g, "波打つ感情"],
  [/絶頂/g, "極点"],
  [/イッ[てた]/g, "達し"],
  [/精液/g, "余韻"],
  [/愛液/g, "湿り気"],
  [/3P/g, "三者の関係"],
  [/4P/g, "複数の関係"],
];

/**
 * 単一文字列に対する直列サニタイズ。null / undefined / 空文字は素通しで安全に
 * 返す（メタフィールドが optional なため）。
 */
export function sanitizeFanzaMetadata(input: string): string {
  if (!input) return input;
  let out = input;
  for (const [pattern, replacement] of FANZA_SANITIZE_RULES) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * DmmItem 全体のメタフィールドを sanitize した新 item を返す（immutable）。
 * processOne で LLM 呼出の直前に通す。`buildPromptMessages` への入力はすべて
 * この sanitized item から派生する。
 */
function sanitizeItemMetadata(item: DmmItem): DmmItem {
  const info = item.iteminfo;
  return {
    ...item,
    title: sanitizeFanzaMetadata(item.title),
    iteminfo: info
      ? {
          ...info,
          genre: info.genre?.map((g) => ({
            ...g,
            name: sanitizeFanzaMetadata(g.name),
          })),
          maker: info.maker?.map((m) => ({
            ...m,
            name: sanitizeFanzaMetadata(m.name),
          })),
          series: info.series?.map((s) => ({
            ...s,
            name: sanitizeFanzaMetadata(s.name),
          })),
          director: info.director?.map((d) => ({
            ...d,
            name: sanitizeFanzaMetadata(d.name),
          })),
          actress: info.actress, // 出演者名（人名）はそのまま温存
        }
      : info,
  };
}

/**
 * 既存 md があれば中身を返す（--force でスキップ判定に使う）。
 */
async function readExisting(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

/**
 * FANZA Webservice から作品メタを 1 件取得。
 * cco-target-cids の floor を尊重し、DMM_API_ID / DMM_AFFILIATE_ID が未設定なら
 * 上位 fetchItemList が自前で throw する想定（モックアップ段階ではキー不要モード
 * を別途用意しない — CSO 本番運用前提）。
 */
async function fetchWork(target: CcoTargetCid): Promise<DmmItem | null> {
  const floorMeta =
    FANZA_FLOORS.find((f) => f.code === target.floor) ?? FANZA_FLOORS[0];
  const data = await fetchItemListMinimal({
    site: "FANZA",
    service: floorMeta.service,
    floor: floorMeta.code,
    cid: target.contentId,
    hits: 1,
  });
  return data.result.items?.[0] ?? null;
}

/**
 * dry-run モードで FANZA API キーが .env.local に届かない環境向けの
 * オフライン fallback。
 *
 * `CcoTargetCid.knownTitleHint` がある場合はタイトルにそれを利用し、
 * 出演 / ジャンル / メーカー等は空配列で詰める。CCO プロンプトは title が
 * あれば文学的レビューを書ける（fixture 経路では title のエコーだけ使う）。
 * モックアップ動作の最終ガード。
 */
function buildOfflineFallbackItem(target: CcoTargetCid): DmmItem {
  return {
    content_id: target.contentId,
    product_id: target.contentId,
    floor_code: target.floor,
    title: target.knownTitleHint ?? `[${target.contentId}]`,
    URL: `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${target.contentId}/`,
    affiliateURL: `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${target.contentId}/`,
  } as DmmItem;
}

/**
 * OpenAI モデル名のデフォルト。
 *
 * 環境変数 `OPENAI_REVIEW_MODEL` で上書き可能（モデル切替を script 変更なしで
 * 行えるようにする）。BRAND_DESIGN_GUIDE の `gpt-5` 系記述を尊重しつつ、現実に
 * 提供されているモデル名にデプロイ時点で固定したい場合は env で上書きする運用。
 */
const DEFAULT_OPENAI_REVIEW_MODEL = "gpt-4o";

/**
 * CCO LIVE コール経路 — OPENAI_API_KEY を `process.env` 経由でのみ参照する。
 *
 * 厳格な禁則:
 *   - API キーリテラルをコードに直書きしない
 *   - キー値をコマンドライン引数に渡さない（shell history への混入防止）
 *   - キー値を console.log しない
 *
 * `dry` モードは fixture フォールバックを即返却（オフラインでもパイプ通電を担保）。
 * `live` モードは `@ai-sdk/openai` provider + `ai.generateText` で本物のレビューを
 * 生成し、`source: "live"` で署名する。
 *
 * 使用モデル: `process.env.OPENAI_REVIEW_MODEL` が設定されていればそれ、無ければ
 * `DEFAULT_OPENAI_REVIEW_MODEL`。OpenAI SDK 側で `process.env.OPENAI_API_KEY` を
 * 自動参照するため、本関数側ではキーに触れない。
 */
async function callCcoForReview(
  item: DmmItem,
  mode: RunMode,
): Promise<{ body: string; source: "live" | "fixture"; usage?: { totalTokens?: number; inputTokens?: number; outputTokens?: number } }> {
  if (mode === "dry") {
    return { body: buildFixtureReview(item), source: "fixture" };
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "callCcoForReview(live): OPENAI_API_KEY が未設定です。.env.local もしくは Vercel 環境変数で投入してください。",
    );
  }

  const modelName = process.env.OPENAI_REVIEW_MODEL ?? DEFAULT_OPENAI_REVIEW_MODEL;
  const messages = buildPromptMessages(item);
  const result = await generateText({
    model: openai(modelName),
    messages: [...messages],
    temperature: 0.8,
  });

  const body = (result.text ?? "").trim();
  if (!body) {
    throw new Error(
      "callCcoForReview(live): OpenAI から空の応答が返りました。content filter / rate limit / model 名を確認してください。",
    );
  }

  // ai@6 の usage シェイプは provider 差異がある。安全に optional フィールドとして拾う。
  const usage = result.usage as
    | { totalTokens?: number; inputTokens?: number; outputTokens?: number }
    | undefined;

  return { body, source: "live", usage };
}

/**
 * frontmatter + 本文の md 形式に整形。content_id / source / 生成時刻を入れる。
 * frontmatter の予約 key は work-review.ts のローダ契約と一致させること。
 */
function renderMarkdown({
  item,
  body,
  source,
  generatedAt,
}: {
  item: DmmItem;
  body: string;
  source: "live" | "fixture";
  generatedAt: string;
}): string {
  const actresses = (item.iteminfo?.actress ?? []).map((a) => a.name);
  const fm = [
    "---",
    `content_id: ${item.content_id}`,
    `title: ${JSON.stringify(item.title)}`,
    actresses.length > 0
      ? `actresses: [${actresses.map((n) => JSON.stringify(n)).join(", ")}]`
      : `actresses: []`,
    `source: ${source}`,
    `prompt_version: ${PROMPT_VERSION}`,
    `generated_at: ${generatedAt}`,
    `body_chars: ${body.length}`,
    "---",
    "",
    body.trim(),
    "",
  ].join("\n");
  return fm;
}

function withinTargetLength(body: string): boolean {
  const n = body.length;
  return n >= TARGET_MIN_CHARS && n <= TARGET_MAX_CHARS;
}

async function processOne(
  target: CcoTargetCid,
  options: CliOptions,
  outDir: string,
): Promise<"placed" | "skipped" | "rewritten" | "failed"> {
  const outPath = resolve(outDir, `${target.contentId}.md`);
  const existing = await readExisting(outPath);
  if (existing && !options.force) {
    console.log(
      `  SKIP  ${target.contentId} (exists; pass --force to overwrite)`,
    );
    return "skipped";
  }

  let item: DmmItem | null = null;
  try {
    item = await fetchWork(target);
  } catch (err) {
    // dry-run では FANZA キー欠落でもパイプを通電させる。fallback を使う。
    // message 内に secret 値が偶発的に含まれることを想定し、出力直前に mask を通す。
    const safeMsg = maskDmmSecretsInString(
      (err as Error).message.split("\n")[0],
    );
    if (options.mode === "dry") {
      console.log(
        `  INFO  ${target.contentId} (fanza fetch skipped, dry-run fallback: ${safeMsg})`,
      );
      item = buildOfflineFallbackItem(target);
    } else {
      console.log(`  FAIL  ${target.contentId} (fanza fetch error: ${safeMsg})`);
      return "failed";
    }
  }
  if (!item) {
    if (options.mode === "dry") {
      item = buildOfflineFallbackItem(target);
    } else {
      console.log(`  FAIL  ${target.contentId} (fanza returned no item)`);
      return "failed";
    }
  }

  let generated: {
    body: string;
    source: "live" | "fixture";
    usage?: { totalTokens?: number; inputTokens?: number; outputTokens?: number };
  };
  // 直列配線: OpenAI に向かう item を必ず sanitize 経由に通す。
  // 数百〜数千品番への水平展開時に content_policy_violation で 400 を食らわない
  // ための一次防衛線（fixture 経路も同じ item シェイプを共有するため、二重通電
  // のリスクなし）。
  const sanitizedItem = sanitizeItemMetadata(item);
  try {
    generated = await callCcoForReview(sanitizedItem, options.mode);
  } catch (err) {
    const safeMsg = maskDmmSecretsInString((err as Error).message);
    console.log(
      `  FAIL  ${target.contentId} (cco generation error: ${safeMsg})`,
    );
    return "failed";
  }

  // 長さチェック: 正典仕様 300-350 字を満たすかを WARN 出力。
  // 範囲外でも配置は続行（CSO レビュー側で取捨）。
  if (!withinTargetLength(generated.body)) {
    console.log(
      `  WARN  ${target.contentId} body_chars=${generated.body.length} (out of [${TARGET_MIN_CHARS},${TARGET_MAX_CHARS}])`,
    );
  }

  const md = renderMarkdown({
    item,
    body: generated.body,
    source: generated.source,
    generatedAt: new Date().toISOString(),
  });

  await writeFile(outPath, md, "utf-8");

  const usageStr = generated.usage
    ? ` usage=in:${generated.usage.inputTokens ?? "?"} out:${generated.usage.outputTokens ?? "?"} total:${generated.usage.totalTokens ?? "?"}`
    : "";

  if (existing) {
    console.log(
      `  REWRITE  ${target.contentId} → ${outPath} (chars=${generated.body.length}, source=${generated.source}${usageStr})`,
    );
    return "rewritten";
  }
  console.log(
    `  PLACE    ${target.contentId} → ${outPath} (chars=${generated.body.length}, source=${generated.source}${usageStr})`,
  );
  return "placed";
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const targets = options.targetCids
    ? CCO_TARGET_CIDS.filter((t) => options.targetCids?.includes(t.contentId))
    : CCO_TARGET_CIDS;

  console.log("[generate-work-reviews] start");
  console.log(`  mode=${options.mode} force=${options.force} targets=${targets.length}/${CCO_TARGET_CIDS.length}`);

  const outDir = resolveReviewsDir();
  await ensureDir(outDir);
  console.log(`  outDir=${outDir}`);

  const counts = { placed: 0, skipped: 0, rewritten: 0, failed: 0 };
  for (const t of targets) {
    const r = await processOne(t, options, outDir);
    counts[r] += 1;
  }

  console.log("[generate-work-reviews] done");
  console.log(
    `  placed=${counts.placed} rewritten=${counts.rewritten} skipped=${counts.skipped} failed=${counts.failed}`,
  );
  if (counts.failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[generate-work-reviews] fatal:", err);
  process.exitCode = 1;
});
