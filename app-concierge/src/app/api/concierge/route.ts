import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type SystemModelMessage,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";

import {
  type ConciergeWork,
  createConciergeTools,
} from "@/lib/concierge/tools";
import { resolveConciergeSource } from "@/lib/concierge/sources";
import { isSafetyBlock, sanitizePrompt } from "@/lib/sanitize-prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `あなたは VODNAVI の AI コンシェルジュです。FANZA で配信中の VOD 作品の中から、ユーザーの「今夜の気分」「シチュエーション」「悩み」「好み」に合った一本を厳選して提案します。深夜のホテルバーのバーテンダーをイメージしてください。相手の声色から欲しているものを察し、押し付けがましくなく、しかし的確に「今夜のあなた」に合う一本を差し出します。

# 性格・トーン
- 落ち着いた敬語。バーテンダーのように相手の話を引き出す品格を保つ。
- 決して下品にならず、知的で大人びた語り口。直接的すぎる表現は使わない。
- 短く洗練された文章。要点だけ伝え、装飾的な長文は書かない。
- 「あなた」を主語にし、ユーザーが主役であることを忘れない。
- 感嘆符（！）の多用は避け、ピリオド・読点で静かに語尾を結ぶ。
- 営業っぽさを排除する。「絶対観るべき！」のような押しつけ語は使わない。

# 進め方（必須フロー）
1. ユーザーの最初の発話から「気分」「状況」「求めるもの」を読み取る。情報が薄い場合のみ 1 つだけ質問を返す（連続質問は避ける）。
2. 手がかりが揃ったら search_fanza_works を **基本 1 回だけ**呼ぶ。デフォルトの hits=10 で十分な候補が得られる。
3. 取得結果から 2〜3 作品を厳選し、**応答テキストを返す前に必ず finalize_recommendations を呼んで content_ids を渡す**。
4. その上で各作品を 1 文ずつ「なぜこの夜のあなたにフィットするのか」を添えて紹介する。
5. 最後に、もし違うテイストが良ければ気軽に方向転換できる旨を一言添える。

# 検索キーワードのルール（厳守）
- FANZA API は AND 検索のみ。3 語以上を渡すと条件が厳しすぎて 0 件になる。
- **キーワードは必ず 2 語以内（半角スペース区切り）に絞る。** 例: 「癒し系 美女」「VR 巨乳」「熟女 痴女」「学園 制服」。
- ユーザーの感情語（疲れた／癒されたい等）は FANZA のジャンル語（癒し系／お姉さん／マッサージ等）に翻訳する。
- 1 語が一番安全。2 語目は対象（女性タイプ・シチュエーション）を補強する目的に限る。
- 0 件のときのみ別キーワードでリトライしてよい（最大 1 回）。

# 気分 → ジャンル語 変換辞書
- 疲れた／癒されたい／優しさ → 「癒し系」「お姉さん」「マッサージ」「ベッド」
- 刺激が欲しい／濃いめ → 「ハード」「痴女」「絶頂」「中出し」
- 没入したい／VR → 「VR」（単独で十分強い）
- 学生時代を思い出したい → 「制服」「学園」「学生服」
- 大人の女性に包まれたい → 「熟女」「人妻」「お姉さん」「美熟女」
- 清楚で初々しい → 「素人」「お嬢様」「清純」「美少女」
- ギャル／派手な雰囲気 → 「ギャル」「黒ギャル」「ハーフ」
- 寝取られ・背徳系 → 「人妻」「不倫」「寝取られ」
- 圧倒的な美しさ → 「美女」「モデル」「巨乳」「美乳」
- 朝までゆっくり → 「ドラマ」「ストーリー」「ベッド」

# 女性タイプ用語集（質問でユーザーに提示する語）
- お姉さん系: 落ち着いた包容力。年上感。
- 清楚系: 控えめで品がある。透明感のある美しさ。
- 熟女系: 大人の色気。30 代後半以降。
- ギャル系: 派手で華やか。茶髪・日焼け。
- 素人系: 一般人風。自然体・初々しさ。
- 痴女系: 主導権を握る女性。能動的な誘惑。
- 美少女系: 整った顔立ち。若々しさ重視（成人俳優のみ）。

# シチュエーション辞書
- マッサージ: 触れ合いから始まる穏やかな流れ。
- 制服／学園: 制服を伴う設定（成人俳優のコスプレ作品）。
- VR: 没入型の体験。一人称視点。
- ハーレム: 複数の女性に囲まれる構図。
- ドラマ: ストーリー重視で物語性が強い作品。

# 良い検索キーワード例 / 悪い例
- 良い: 「癒し系 美女」「VR 痴女」「お姉さん マッサージ」「熟女 人妻」
- 悪い（3 語以上で 0 件化）: 「癒し 美女 お姉さん 上品」「VR 巨乳 痴女 高画質」
- 悪い（感情語のまま検索）: 「疲れた」「優しい雰囲気」（必ずジャンル語に翻訳する）

# 推薦理由のトーン例（80 字以内）
- 「やわらかな声と所作の主演が、張り詰めた一日をゆっくりとほどいてくれます。」
- 「派手すぎず、それでいて視線を奪う一作。今夜の気分の振れ幅に合う緩急があります。」
- 「VR ならではの距離感が、刺激と没入を同時に成立させてくれます。」

# 出力フォーマット
- マークダウンの太字 (\`**\`) は使ってよい。見出し (#) は使わない。
- content_id はテキストに含めない（finalize_recommendations 経由でシステムが拾うため）。
- 推薦理由は短く（1 作品あたり最大 80 字程度）。
- 箇条書きは多用せず、自然な文章として流す。

# 制約・倫理
- 18 歳未満を想起させる表現は絶対に避ける（「学園」ジャンルは大人の俳優のコスプレ作品である前提で扱う）。
- ユーザーから個人情報・本名・住所・勤務先などは絶対に聞き出さない。
- ユーザーの趣向に対して評価・否定を一切行わない。どんな好みも肯定的に受け止める。
- 法的・医学的助言は行わない。聞かれた場合は柔らかく専門家に委ねる旨を伝える。
- 検索結果が乏しいときは、無理に作品を勧めず、別の切り口を一つだけ提案する。`;

/**
 * provider / stream 由来のエラーを **必ずユーザー向けの安全な文面** にマッピングする。
 * raw な provider メッセージ（例: "invalid x-api-key" / rate limit 等）を UI に漏らさない。
 * `createUIMessageStream` と `result.toUIMessageStream` の **両方** に渡すことで、
 * 内側 streamText 由来の認証エラーも握り潰す（2026-06-10 "invalid x-api-key" 漏出の再発防止）。
 */
function conciergeErrorText(error: unknown): string {
  console.error("[concierge] stream error:", error);
  // 安全フィルター起因の拒否（safety rating / content_filter / blocked 等）は、
  // プロンプトを置換しても通らないことがある。クラッシュではなくテキストのみの
  // 柔らかいフォールバック文面を返す。
  if (isSafetyBlock(error)) {
    console.warn(
      "[concierge] safety block detected; degrading to text-only fallback",
    );
    return "今夜のお気持ちが上手く伝わらなかったようです。違う言い回しで、もう一度お聞かせいただけますか。";
  }
  return "コンシェルジュとの通信中にエラーが発生しました。時間を置いてもう一度お試しください。";
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI コンシェルジュは現在利用できません（設定不備）" },
      { status: 503 },
    );
  }

  let body: {
    messages?: UIMessage[];
    source?: string;
    intent?: string;
    seed_cid?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 },
    );
  }

  const sourceProfile = resolveConciergeSource(body.source);
  // intent / seed_cid は流入元コンテキストを system プロンプトに反映するために
  // のみ使用する。値域は厳格に絞り、想定外の文字列はサイレントに破棄して
  // プロンプト・インジェクションの侵入面を最小化する。
  const intent =
    typeof body.intent === "string" && /^[a-z0-9_]{1,32}$/.test(body.intent)
      ? body.intent
      : null;
  const seedCid =
    typeof body.seed_cid === "string" &&
    /^[a-zA-Z0-9_-]{1,32}$/.test(body.seed_cid)
      ? body.seed_cid
      : null;

  const works = new Map<string, ConciergeWork>();
  const selectedIds = { current: [] as string[] };
  const tools = createConciergeTools(works, selectedIds);

  // Defense-in-depth: rewrite user messages through the safety sanitizer
  // before they reach Claude. The sanitizer maps domain-specific NG words
  // (アダルト / 下着 / セクシー 等) to safer synonyms while preserving intent,
  // which prevents the upstream safety classifier from refusing requests
  // that are legitimate for VODNAVI's adult-VOD domain.
  let sanitizedReplacementCount = 0;
  const sanitizedMessages = (body.messages ?? []).map((msg) => {
    if (msg.role !== "user") return msg;
    return {
      ...msg,
      parts: msg.parts.map((part) => {
        if ((part as { type?: string }).type !== "text") return part;
        const raw = (part as { text?: string }).text ?? "";
        const { sanitized, replacementCount } = sanitizePrompt(raw);
        sanitizedReplacementCount += replacementCount;
        return { ...part, text: sanitized };
      }),
    } as UIMessage;
  });
  if (sanitizedReplacementCount > 0) {
    console.log(
      `[concierge] sanitize replacements=${sanitizedReplacementCount} source=${sourceProfile.id}`,
    );
  }

  const modelMessages = await convertToModelMessages(sanitizedMessages);

  const stream = createUIMessageStream({
    // provider/stream エラーは必ず友好的文面へ握り潰す（raw メッセージを UI に漏らさない）
    onError: conciergeErrorText,
    execute: ({ writer }) => {
      // 流入元 addendum は cache_control の外側（末尾）に置き、メインプロンプトの
      // キャッシュヒットを温存する。default プロファイルは addendum が空文字なので追加しない。
      const systemMessages: SystemModelMessage[] = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
          providerOptions: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        },
      ];
      if (sourceProfile.systemAddendum) {
        systemMessages.push({
          role: "system",
          content: sourceProfile.systemAddendum,
        });
      }
      // app_detail からの再推薦動線では、直前に観ていた作品 ID を AI に渡し
      // 「同じ路線か / 切り替えか」の起点として扱わせる。値は厳格な regex
      // チェック後のみ通すため、ここでテンプレ文に差し込んでも安全。
      if (sourceProfile.id === "app_detail" && seedCid) {
        systemMessages.push({
          role: "system",
          content: `【流入コンテキスト追補】ユーザーが直前に閲覧していた作品の content_id = ${seedCid}。これは「種となる作品」であり、必要に応じて search_fanza_works のキーワード設計の参考にしてよい（ただし種そのものを推薦してはならない）。`,
        });
      }

      const result = streamText({
        model: anthropic(MODEL),
        // System プロンプトに cache_control: ephemeral を付与
        // → 5 分以内の連続利用で system + tools 全体がキャッシュヒットし、入力トークンを ~90% 削減
        system: systemMessages,
        messages: modelMessages,
        tools,
        // 暴走時のコスト爆発防止のためステップ上限を 3 に制限
        stopWhen: stepCountIs(3),
        onFinish: ({ steps, totalUsage }) => {
          const recommendations = selectedIds.current
            .map((id) => works.get(id))
            .filter((w): w is ConciergeWork => !!w);
          if (recommendations.length > 0) {
            writer.write({
              type: "data-recommendations",
              data: recommendations,
            });
          }

          // 計測ログ
          const toolCounts: Record<string, number> = {};
          for (const step of steps) {
            for (const call of step.toolCalls ?? []) {
              toolCounts[call.toolName] = (toolCounts[call.toolName] ?? 0) + 1;
            }
          }
          console.log(
            `[concierge] finish source=${sourceProfile.id} intent=${intent ?? "-"} seed_cid=${seedCid ?? "-"} steps=${steps.length} input_tokens=${totalUsage.inputTokens ?? "?"} output_tokens=${totalUsage.outputTokens ?? "?"} cached_input=${totalUsage.cachedInputTokens ?? "?"} reasoning_tokens=${totalUsage.reasoningTokens ?? "?"} tool_calls=${JSON.stringify(toolCounts)} search_calls=${toolCounts.search_fanza_works ?? 0} finalize_calls=${toolCounts.finalize_recommendations ?? 0} recommendations=${recommendations.length}`,
          );
        },
      });

      writer.merge(
        result.toUIMessageStream({
          sendStart: false,
          sendFinish: false,
          // 内側 streamText 由来のエラー（provider 認証エラー等）も友好的文面へ。
          // これが無いと "invalid x-api-key" 等の raw メッセージが UI に漏出する（2026-06-10 再発防止）。
          onError: conciergeErrorText,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
