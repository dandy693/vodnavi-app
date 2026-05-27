/**
 * CCO (ChatGPT 5.5) に投げる「文学的官能レビュー」生成プロンプトの構築層。
 *
 * BRAND_DESIGN_GUIDE.md §1 / §4 完全準拠:
 *   - チープなアダルトコピーを徹底排除（「徹底解説」「おすすめ」「神回」等は禁則）
 *   - ピンク / ネオン / 直接的な性的単語を排し、シャンパンゴールド × リッチブラックの
 *     文学的トーン（知的バーテンダー / 図書館の奥）に寄せる
 *   - E-E-A-T を満たすため、FANZA 公式あらすじの言い換えではなく独自視点を要求
 *   - 出力は 300〜500 字。300 字未満 / 500 字超は再試行対象
 *
 * 本ファイルはプロンプトの **物理的単一情報源** とする。CCO とのレビュー仕様
 * 交渉はすべてここに集約し、`scripts/generate-work-reviews.ts` は本モジュールを
 * 経由してのみプロンプトを組み立てる。
 */

import type { DmmItem } from "../src/lib/fanza/types.ts";

export const PROMPT_VERSION = "cco-review-v1.0.0";
export const TARGET_MIN_CHARS = 300;
export const TARGET_MAX_CHARS = 500;

const SYSTEM_PROMPT = `あなたは VODNAVI（『ビブリア・エロティカ — 官能の図書館』）の編集者です。
以下の鉄則を絶対に守って、作品レビュー本文を日本語で書いてください。

【世界観の鉄則】
- 想定読者: 知的好奇心と疲労を抱え、夜の書斎で 1 杯のグラスを傾ける大人。
- 文体: 知的でミステリアスな、洗練されたバーテンダーの語り口。明朝体が似合う品位。
- ピンク・ネオン・チープなアダルト語彙（"神回"・"激エロ"・"〜選"・"必見"・"絶対"・"〜の魅力"・"おすすめ"・"徹底解説"・"〜のすゝめ"・絵文字）は **禁則**。
- 直接的な性器名・行為名の連発は避け、視線、距離、間合い、呼吸、沈黙、余韻で官能を立ち上げる。
- 直接的な単語を使う場合も、書斎で本を朗読する声の温度でとどめる。
- 露骨な絶賛・営業感は排除。落ち着いた批評と共感のトーンを保つ。

【構造の鉄則】
- 300〜500 字（日本語文字数）。改行は段落の自然な区切りでのみ。
- 出だしは、シーンが立ち上がる気配 / 観る者の心理を 1 文で素描してから入る。
- 中盤で、この作品ならではの「視線設計 / 距離設計 / 時間設計」のいずれかを 1 つだけ静かに掘る。
- 末尾は「今夜、この作品を選ぶことの意味」を 1〜2 文で締める。煽らない。

【出力フォーマット】
- 本文のみを出力。前置き / 注釈 / Markdown 見出し / 箇条書きを含めない。
- 出力は地の文だけ。改行は段落区切り 1〜2 箇所まで。`;

/**
 * CCO に渡す user メッセージを、作品メタから組み立てる。
 */
export function buildUserPrompt(item: DmmItem): string {
  const actresses = (item.iteminfo?.actress ?? [])
    .slice(0, 4)
    .map((p) => p.name)
    .join("、");
  const genres = (item.iteminfo?.genre ?? [])
    .slice(0, 6)
    .map((g) => g.name)
    .join("、");
  const makers = (item.iteminfo?.maker ?? [])
    .slice(0, 2)
    .map((m) => m.name)
    .join("、");

  const lines: string[] = [];
  lines.push(`【作品 ID】${item.content_id}`);
  lines.push(`【作品タイトル】${item.title}`);
  if (actresses) lines.push(`【出演】${actresses}`);
  if (genres) lines.push(`【ジャンル】${genres}`);
  if (makers) lines.push(`【メーカー】${makers}`);
  if (item.date) lines.push(`【公開日】${item.date.split(" ")[0]}`);
  lines.push("");
  lines.push(
    `上記の作品について、BRAND_DESIGN_GUIDE.md の『ビブリア・エロティカ』仕様で、${TARGET_MIN_CHARS}〜${TARGET_MAX_CHARS} 字の文学的官能レビューを書いてください。`,
  );
  lines.push("FANZA 公式あらすじをそのまま要約することは禁則。VODNAVI 独自の視座のみ。");

  return lines.join("\n");
}

/**
 * CCO への 2 メッセージ system+user payload。Vercel AI SDK 互換シェイプ。
 */
export type CcoPromptMessages = ReadonlyArray<{
  role: "system" | "user";
  content: string;
}>;

export function buildPromptMessages(item: DmmItem): CcoPromptMessages {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(item) },
  ];
}

/**
 * dry-run / OPENAI_API_KEY 未設定時の構造的フォールバック本文。
 *
 * CSO 仕様の物理パイプライン（入力 → 生成 → 配置）が、API キー有無に依存せず
 * 構造的に通電することを確認するための **モックアップ用 fixture**。
 * 実コール時はこのフォールバックを通らない（generate-work-reviews.ts 側で
 * `mode === "live"` 経路へ自動切替）。
 *
 * 本文自体は BRAND_DESIGN_GUIDE のトーンで書き、CCO 実生成と区別できるよう
 * 末尾に [FIXTURE] マークを付ける。CSO レビュー時に「これは fixture」と一目で
 * わかるようにするため。
 */
export function buildFixtureReview(item: DmmItem): string {
  const titleEcho = item.title.length > 24 ? `${item.title.slice(0, 24)}…` : item.title;
  return [
    `夜が静かに肩を落とすころ、画面の向こうに立ち上がるのは、この作品の主役だけが知っている気配です。${titleEcho} は派手な刺激の連続ではなく、視線と沈黙が交互に語りかけてくる時間の設計を選びました。`,
    `この一篇の核心は、近づきすぎないことの色気にあります。映る人物が次にどう動くかを観る側がわずかに先回りしてしまう──その読み違えと符号の往復に、知性と本能が同じ速度で並走する瞬間が訪れます。書斎の読書灯のような光量で、感情の輪郭が静かに濃くなっていく。`,
    `今夜、この作品を選ぶことは、騒がしい娯楽から少し離れて、自分の呼吸を整え直すことに似ています。グラスの氷が溶けるテンポで、ゆっくり最後まで付き合う価値がある一本です。[FIXTURE]`,
  ].join("\n\n");
}
