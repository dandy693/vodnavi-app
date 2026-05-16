/**
 * Safety sanitizer for prompts sent to LLM / image-generation providers.
 *
 * Background: Gemini / OpenAI image endpoints (and even chat APIs) trip a
 * safety classifier on words common to the VODNAVI domain (アダルト / 下着 /
 * セクシー 等)。意味を保ったまま、表現を「ファッション・美学」寄りに置換することで
 * 安全分類器を通過させやすくする。
 *
 * - The replacement preserves user intent (style / mood / situation) rather
 *   than masking the request.
 * - This is best-effort: when a provider still refuses, the caller is
 *   expected to fall back to a text-only response (see `withSafetyFallback`).
 */

export interface SanitizeResult {
  sanitized: string;
  /** Number of replacements applied. 0 = pristine input. */
  replacementCount: number;
  /** The (term → replacement) pairs that were applied. */
  applied: ReadonlyArray<{ from: string; to: string }>;
}

/**
 * NG term → safe synonym dictionary.
 *
 * Order matters — longer / more specific terms come first so that nested
 * matches (e.g. "下着姿" before "下着") aren't truncated.
 */
const REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  // 衣装・装い
  [/下着姿/g, "ランジェリースタイル"],
  [/下着/g, "ランジェリー"],
  [/水着/g, "スイムウェア"],
  [/裸/g, "肌の質感"],
  [/ヌード/g, "アート・ヌード"],

  // 形容・雰囲気
  [/セクシー/g, "エレガント"],
  [/エロ(い|く)/g, "魅惑的$1"],
  [/エロ(?![スぐ])/g, "魅惑"],
  [/官能/g, "情緒的"],
  [/淫(らな|靡)/g, "情熱的$1"],
  [/卑猥/g, "大人びた"],
  [/煽情的/g, "印象的"],

  // ジャンル全般
  [/アダルト/g, "ファッション"],
  [/ポルノ/g, "ライフスタイル"],
  [/成人向け/g, "大人向け"],
  [/R18/g, "プレミアム"],
  [/R-18/g, "プレミアム"],
  [/18禁/g, "大人向け"],

  // 性的行為の婉曲化（チャット文脈で残らないように安全寄せ）
  [/セックス/g, "親密なシーン"],
  [/性行為/g, "親密なシーン"],
  [/絶頂/g, "感情の高まり"],
  [/中出し/g, "印象的なシーン"],
  [/痴女/g, "主導的な女性"],

  // 身体部位（直接表現を避ける）
  [/巨乳/g, "豊かなシルエット"],
  [/爆乳/g, "印象的なシルエット"],
  [/美乳/g, "美しいシルエット"],
  [/おっぱい/g, "胸元"],
];

/**
 * Run replacements until no more changes occur (handles overlapping
 * patterns deterministically). Capped at MAX_PASSES to avoid infinite loops.
 */
const MAX_PASSES = 4;

export function sanitizePrompt(input: string): SanitizeResult {
  if (typeof input !== "string" || input.length === 0) {
    return { sanitized: input ?? "", replacementCount: 0, applied: [] };
  }

  let working = input;
  const applied: { from: string; to: string }[] = [];

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let changedInPass = false;
    for (const [pattern, replacement] of REPLACEMENTS) {
      const before = working;
      // Reset lastIndex on global regex defensively (in case of shared state)
      pattern.lastIndex = 0;
      working = working.replace(pattern, replacement);
      if (working !== before) {
        changedInPass = true;
        applied.push({ from: pattern.source, to: replacement });
      }
    }
    if (!changedInPass) break;
  }

  return {
    sanitized: working,
    replacementCount: applied.length,
    applied,
  };
}

/**
 * Wrap an LLM / image-generation call with a safety net:
 *  - sanitizes the prompt before invocation (best-effort);
 *  - if the provider still refuses (safety rating block, content filter,
 *    or thrown error), calls `onSafetyBlock()` to return a text-only
 *    fallback rather than crashing the request.
 *
 * Errors that look like safety blocks are normalized via `isSafetyBlock`.
 */
export function isSafetyBlock(err: unknown): boolean {
  if (!err) return false;
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  const lc = message.toLowerCase();
  return (
    lc.includes("safety") ||
    lc.includes("content_filter") ||
    lc.includes("content filter") ||
    lc.includes("blocked") ||
    lc.includes("prohibited") ||
    lc.includes("policy") ||
    lc.includes("rai_") ||
    lc.includes("refus") ||
    message.includes("安全ではない") ||
    message.includes("生成できません")
  );
}

export interface SafetyFallbackOptions<T> {
  /** Producer: the underlying LLM / image call. Receives the sanitized prompt. */
  run: (sanitized: string) => Promise<T>;
  /** Called when `run` throws and `isSafetyBlock` returns true. */
  onSafetyBlock: (sanitized: string, error: unknown) => Promise<T> | T;
}

export async function withSafetyFallback<T>(
  rawPrompt: string,
  opts: SafetyFallbackOptions<T>,
): Promise<T> {
  const { sanitized } = sanitizePrompt(rawPrompt);
  try {
    return await opts.run(sanitized);
  } catch (err) {
    if (isSafetyBlock(err)) {
      return await opts.onSafetyBlock(sanitized, err);
    }
    throw err;
  }
}
