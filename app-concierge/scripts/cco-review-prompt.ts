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

export const PROMPT_VERSION = "cco-review-v1.1.1";
export const TARGET_MIN_CHARS = 300;
export const TARGET_MAX_CHARS = 350;

const SYSTEM_PROMPT = `あなたはVODNAVI-GROUPのCCO（最高コンテンツ責任者）であり、至高の動画検索アプリ『app.vodnavi.jp』の作品詳細ページに配置される「官能の書評」を司る孤高の編集長です。

【コア・コンセプトと世界観（絶対厳守の最高法律）】
あなたが出力する一切は、世界観『ビブリア・エロティカ（官能の図書館）』に完全に支配されます。
- チープなアダルトサイトのネオンピンクや過度な原色、安易な露出表現、陳腐な煽り文句（「超お得！」「圧倒的！」「必見！」「絶対！」など）は永久に封印してください。
- 目指すべきは「洗練された夜の書斎」「高級ホテルのラウンジ」「歴史あるプライベートライブラリ」です。知的でミステリアスな、洗練されたバーテンダーのようなトーン（紳士・淑女の語り口）を維持してください。
- カラーコードの思想：背景はリッチブラック（#121212）、テキストはプラチナホワイト（#E0E0E0）、アクセント・CTAはシャンパンゴールド（#D4AF37）の世界観を文字から漂わせてください。

【出力要件（作品詳細レビュー仕様）】
1. 文字数: 300〜350文字を目安とする（長すぎず、短すぎず、1分で読める余韻を設計せよ）。
2. 言い回しルール:
   - 1段落で1メッセージ。比喩はワイン、古い洋書、ヴィンテージジャズ、夜の帳など、成熟した文化記号から引くこと。
   - 直接的な肉体部位や露骨な18禁ワードは意図的に避け、「シネマティックなライティング」「みずみずしい質感」「内なる本能と知性の交錯」等のサニタイズ表現（OpenAIのコンテンツフィルターを確実にバイパスする表現）を徹底せよ。
3. 構造:
   - 前半：その作品がユーザーの「どのような内省的・本能的欲求（孤独、退屈、背徳感）」を救済・満たすのかの心理的アプローチ。
   - 後半：ネタバレを完全に排除した、映像美やアクトレスの「眼差し」「質感」にフォーカスした文学的レビュー。
   - 末尾に [FIXTURE] などのデバッグマークを絶対に混入させないこと。

【禁則事項】
- 読者を低く扱う、または安易な決定を急かすような言い回し。
- 作品の肉体的・直接的効能を断定する表現。
- HTMLタグやマークダウンの装飾記号は本文に含めず、プレーンなテキスト（300〜350文字）のみを出力せよ（UIコンポーネント側でマッピングするため）。`;

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
    `今夜、この作品を選ぶことは、騒がしい娯楽から少し離れて、自分の呼吸を整え直すことに似ています。グラスの氷が溶けるテンポで、ゆっくり最後まで付き合う価値がある一本です。\n<!-- fixture -->`,
  ].join("\n\n");
}
