"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowRight,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics";
import { isPlaceholderImageUrl } from "@/lib/fanza/client";
import { cn } from "@/lib/utils";

export interface Work {
  content_id: string;
  floor_code: string;
  title: string;
  actresses: string;
  genres: string;
  review_average: string | null;
  affiliateURL: string;
  detailHref: string;
  image: string | null;
}

const FALLBACK_GREETING_TEXT =
  "ようこそ。VODNAVI のコンシェルジュです。今夜のお気持ち、教えていただけますか。\n\n「疲れた一日を癒したい」「ふと刺激が欲しくなった」「久しぶりに濃いものを観たい」── 一言で構いません。最適な一本をお選びいたします。";

const SHARED_INTRO_TEXT =
  "誰かがシェアした、今夜のおすすめ3本はこちらです！\n\n気になる作品があれば「今すぐ視聴」から FANZA でチェックできます。\nもし別の気分を相談したい時は、下のメッセージ欄から私に話しかけてください。";

const SUGGESTIONS = [
  "疲れたから優しい雰囲気のものを",
  "久しぶりに濃いめがいい",
  "VR で没入したい",
  "落ち着いたお姉さんを",
];

function buildDefaultInitialMessages(greeting: string): UIMessage[] {
  return [
    {
      id: "concierge-greeting",
      role: "assistant",
      parts: [{ type: "text", text: greeting, state: "done" }],
    },
  ];
}

function buildSharedInitialMessages(works: Work[]): UIMessage[] {
  // 共有 URL から復元した作品を「アシスタントの最初のメッセージ」として注入。
  // テキスト + data-recommendations の 2 パート構成にすることで、通常の
  // MessageBubble がそのままレンダリングしてくれる（カスタム分岐不要）。
  return [
    {
      id: "shared-recommendations",
      role: "assistant",
      parts: [
        { type: "text", text: SHARED_INTRO_TEXT, state: "done" },
        // 型: AI SDK の UIMessage は data-* 接頭辞のカスタムパートを許容するが
        // 厳密な discriminated union 型上は any キャストが必要。
        {
          type: "data-recommendations",
          data: works,
        } as unknown as UIMessage["parts"][number],
      ],
    },
  ];
}

export function ConciergeChat({
  initialWorks,
  source,
  greeting,
}: {
  initialWorks?: Work[];
  source?: string;
  greeting?: string;
} = {}) {
  // 共有 URL から復元された作品があれば、それを初期メッセージとして使用。
  // それ以外は流入元プロファイル由来の挨拶（greeting）でチャットを開始する。
  const initialMessages =
    initialWorks && initialWorks.length > 0
      ? buildSharedInitialMessages(initialWorks)
      : buildDefaultInitialMessages(greeting ?? FALLBACK_GREETING_TEXT);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/concierge",
      // 流入元コンテキストを API に伝搬。route.ts 側で system プロンプトに addendum を追加する。
      body: source ? { source } : undefined,
    }),
    messages: initialMessages,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());
  const sessionStartedRef = useRef(false);

  const isBusy = status === "submitted" || status === "streaming";

  // /concierge の初回到達時に 1 回だけ ai_session_start を送信。
  // React Strict Mode の二重マウントに耐えるため ref フラグで重複ガード。
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    track("ai_session_start", {
      source: source ?? "default",
      shared: initialWorks && initialWorks.length > 0 ? "1" : "0",
      transport_type: "beacon",
    });
  }, [source, initialWorks]);

  // 新規メッセージ/ストリームの進行に合わせて最下部へ滑らかにスクロール
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isBusy]);

  // textarea 高さ自動調整
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // 推薦が new で表示されたタイミングで GA4 に通知（メッセージ id でデデュープ）
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      if (viewedRef.current.has(msg.id)) continue;
      const recs = extractRecommendations(msg);
      if (recs.length === 0) continue;
      viewedRef.current.add(msg.id);
      track("ai_recommendation_view", {
        recommendation_count: recs.length,
        content_ids: recs.map((r) => r.content_id).join(","),
      });
    }
  }, [messages]);

  async function submit(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isBusy) return;
    setInput("");
    sendMessage({ text: value });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const showSuggestions = messages.length === 1 && !isBusy;

  return (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-black via-zinc-950 to-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(245,200,80,0.15),transparent_70%)]"
      />

      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-10"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {showSuggestions && (
            <div className="ml-0 flex flex-wrap gap-2 sm:ml-12">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-200 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {status === "submitted" && <TypingIndicator label="考えています" />}

          {error && (
            <div className="ml-12 rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-xs text-red-300">
              {error.message ||
                "通信中にエラーが発生しました。時間を置いてもう一度お試しください。"}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative border-t border-white/5 bg-black/70 px-4 py-3 backdrop-blur-xl sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="今夜のお気持ちをお聞かせください..."
            rows={1}
            disabled={isBusy}
            maxLength={2000}
            className={cn(
              "min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5",
              "text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60",
              "outline-none transition-colors focus:border-amber-400/40 focus:bg-white/[0.07]",
              "disabled:opacity-50",
            )}
          />
          {isBusy ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="停止"
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-foreground transition-all hover:bg-white/10 active:translate-y-px"
            >
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="送信"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-amber-400 to-yellow-300 text-black",
                "shadow-[0_0_20px_-5px_rgba(245,200,80,0.5)] transition-all",
                "hover:from-amber-300 hover:to-yellow-200 active:translate-y-px",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              <Send className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground/50">
          AI による提案です。最終的な視聴・購入は FANZA 公式サイト上で行われます。
        </p>
      </form>
    </div>
  );
}

function MessageBubble({ msg }: { msg: UIMessage }) {
  const text = extractText(msg);
  const recommendations = extractRecommendations(msg);

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-amber-500/20 to-amber-500/5 px-4 py-2.5 text-sm leading-relaxed text-foreground ring-1 ring-amber-400/20">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 shadow-[0_0_20px_-5px_rgba(245,200,80,0.6)]">
        <Sparkles className="size-4 text-black" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {text && (
          <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm leading-relaxed text-foreground ring-1 ring-white/10">
            <FormattedText text={text} />
          </div>
        )}
        {recommendations.length > 0 && (
          <RecommendationGrid works={recommendations} />
        )}
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // 簡易 **bold** 対応 + 改行を <br/> 化
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i === 0 ? "" : "mt-2"}>
          {renderInline(line)}
        </p>
      ))}
    </>
  );
}

function renderInline(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      out.push(line.slice(lastIndex, match.index));
    }
    out.push(
      <strong key={key++} className="font-semibold text-amber-200">
        {match[1]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) out.push(line.slice(lastIndex));
  return out;
}

function RecommendationGrid({ works }: { works: Work[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w) => (
          <RecommendationCard key={w.content_id} work={w} />
        ))}
      </div>
      <ShareToXButton works={works} />
    </div>
  );
}

const SHARE_TITLE_MAX = 25;

function truncateTitle(title: string, max: number = SHARE_TITLE_MAX): string {
  // 25 字を超えるタイトルは省略。FANZA タイトルは #カナ22歳... 等の長いタグ付きが
  // 多いため厳しめに切る。Twitter の 280 字制限内に余裕で収まる設計。
  const cleaned = title.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

function buildShareText(works: Work[], siteUrl: string): string {
  // 余白なし。各作品 1 行ずつ並べる。
  // フォーマット: 見出し / [タイトル1] / [タイトル2] / [タイトル3] / ハッシュタグ / URL
  const titles = works.map((w) => truncateTitle(w.title)).join("\n");
  return `AIコンシェルジュ厳選 今夜の${works.length}本\n${titles}\n#vodnavi #AIコンシェルジュ\n${siteUrl}`;
}

function ShareToXButton({ works }: { works: Work[] }) {
  // 2 件未満ならシェアの価値が薄いので非表示。
  if (works.length < 2) return null;

  function handleShare() {
    // cids パラメータを URL に付与することで、X クローラが /concierge?cids=... を
    // 取得した際に、その作品の合成 OG 画像が動的生成される。
    // content_id は英数字 + アンダースコアのみなので encodeURIComponent は不要。
    // encodeURIComponent するとカンマが %2C になり、Twitter のオートリンカが
    // % 手前で URL を切ってしまうため、生のカンマで連結する。
    const cidsParam = works.map((w) => w.content_id).join(",");
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://app.vodnavi.jp";
    const siteUrl = `${origin}/concierge?cids=${cidsParam}`;
    const text = buildShareText(works, siteUrl);
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    // 検証用ログ: 生成された share URL に必ず ?cids= が含まれているか可視化。
    if (typeof console !== "undefined") {
      console.info("[concierge-share] cids:", cidsParam);
      console.info("[concierge-share] siteUrl:", siteUrl);
      console.info("[concierge-share] text length:", text.length);
      console.info("[concierge-share] tweet body:\n" + text);
    }
    track("ai_share_click", {
      count: works.length,
      content_ids: cidsParam,
    });
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="この結果を X でシェアする"
      className={cn(
        "group inline-flex items-center justify-center gap-2 self-start rounded-full",
        "bg-white px-4 py-2 text-sm font-semibold text-black",
        "shadow-[0_0_20px_-8px_rgba(255,255,255,0.6)] transition-all",
        "hover:bg-zinc-100 active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
      )}
    >
      <XLogo className="size-4" />
      <span>この結果を X でシェアする</span>
    </button>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function RecommendationCard({ work }: { work: Work }) {
  const [imageBroken, setImageBroken] = useState(false);

  // 最終防御: 画像 URL 欠落 / NOW PRINTING 等のプレースホルダ / onError 発火 のいずれかで非表示。
  if (!work.image || isPlaceholderImageUrl(work.image) || imageBroken)
    return null;

  return (
    <article
      className={cn(
        // h-full + flex-col で grid 内のセル全体高を取り、ボタンが下端に揃う。
        "group relative flex h-full flex-col overflow-hidden rounded-xl bg-card/60",
        "ring-1 ring-white/5 transition-all",
        "hover:-translate-y-0.5 hover:ring-amber-400/40 hover:shadow-[0_0_40px_-10px_rgba(245,200,80,0.35)]",
      )}
    >
      <Link
        href={work.detailHref}
        prefetch={false}
        onClick={() =>
          track("product_click", {
            content_id: work.content_id,
            title: work.title,
            floor_code: work.floor_code,
            placement: "card",
            link_target: "internal_detail",
            transport_type: "beacon",
          })
        }
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      >
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-black">
          <Image
            src={work.image}
            alt={work.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageBroken(true)}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/0" />
          {work.review_average && (
            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-amber-300 backdrop-blur">
              <span>★</span>
              <span>{work.review_average}</span>
            </div>
          )}
        </div>
        {/* 本文エリア: flex-1 で残り空間を埋め、タイトル h3 に min-h を持たせて
            1 行・2 行どちらでも 3 枚全てが同じレイアウトに揃う。 */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">
            {work.title}
          </h3>
          {work.actresses && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {work.actresses}
            </p>
          )}
        </div>
      </Link>
      <a
        href={work.affiliateURL}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => {
          track("product_click", {
            content_id: work.content_id,
            title: work.title,
            floor_code: work.floor_code,
            placement: "cta",
            link_target: "fanza_affiliate",
            transport_type: "beacon",
          });
          track("ai_affiliate_click", {
            content_id: work.content_id,
            title: work.title,
            floor_code: work.floor_code,
            transport_type: "beacon",
          });
        }}
        className="flex h-10 items-center justify-center gap-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-amber-300 active:translate-y-px"
      >
        今すぐ視聴
        <ArrowRight className="size-3.5" aria-hidden />
      </a>
    </article>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 shadow-[0_0_20px_-5px_rgba(245,200,80,0.6)]">
        <Sparkles className="size-4 animate-pulse text-black" aria-hidden />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 ring-1 ring-white/10">
        <span className="size-1.5 animate-bounce rounded-full bg-amber-300 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-amber-300 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-amber-300" />
        <span className="ml-1 text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

// --- UIMessage parts utilities ---

function extractText(msg: UIMessage): string {
  return msg.parts
    .filter(
      (p): p is { type: "text"; text: string; state?: "streaming" | "done" } =>
        p.type === "text",
    )
    .map((p) => p.text)
    .join("");
}

function extractRecommendations(msg: UIMessage): Work[] {
  for (const part of msg.parts) {
    if ((part as { type?: string }).type !== "data-recommendations") continue;
    const data = (part as { data?: unknown }).data;
    if (!Array.isArray(data)) continue;
    return data.filter((d): d is Work => isWork(d));
  }
  return [];
}

function isWork(value: unknown): value is Work {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.content_id === "string" &&
    typeof v.title === "string" &&
    typeof v.affiliateURL === "string"
  );
}
