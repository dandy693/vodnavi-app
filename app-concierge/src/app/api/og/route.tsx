import { ImageResponse } from "next/og";

// 動的合成 OG 画像。Route Handler 形式にすることで searchParams を受け取れる。
// opengraph-image.tsx のファイル規約は params しか渡してこないため、こちらで処理する。
//
// 使い方: /api/og?cids=abc,def,ghi
//   - cids: FANZA content_id をカンマ区切りで最大 3 件
//   - 受け取った各 cid から FANZA CDN の主画像を予めサーバ側で取得（タイムアウト付き）
//   - 取得成功した画像のみを data URI で埋め込んで合成
//   - すべて失敗した場合でもブランド画像にフォールバックして必ず 200 を返す
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

// X クローラのキャッシュ向けレスポンスヘッダ。
// - public: CDN・クライアントキャッシュ両方で共有
// - max-age=86400 (24h): クライアント側のキャッシュ寿命
// - s-maxage=86400 (24h): CDN 側のキャッシュ寿命
// - stale-while-revalidate=604800 (7d): キャッシュ期限切れ後も古いものを返しつつ裏で再生成
//   → 同じ cids 組合せの 2 回目以降は即時応答（Twitter のクローラ遅延でカード未表示を防ぐ）
const CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};

// FANZA CDN 取得タイムアウト。Twitter クローラ全体予算が ~5-7 秒なので
// 各画像 6 秒は余裕がある（並列なので全体は単一画像分の時間）。
const FETCH_TIMEOUT_MS = 6000;

function buildFanzaImageUrl(cid: string): string {
  // FANZA digital/videoa 主画像の URL パターン。
  return `https://pics.dmm.co.jp/digital/video/${cid}/${cid}pl.jpg`;
}

type FetchOutcome =
  | { ok: true; dataUri: string; bytes: number; ms: number }
  | { ok: false; reason: string; ms: number };

/**
 * 画像 URL を取得して data URI (base64) に変換する。
 * 失敗・タイムアウト・プレースホルダ判定で原因を含む構造化結果を返す。
 * Satori の <img src=...> は外部 URL も扱えるが、タイムアウト時に全体が落ちる
 * 挙動が観測されているため、ここで先に取得して安全な data URI に置換する。
 */
async function fetchImageOutcome(url: string): Promise<FetchOutcome> {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // redirect: "manual" で 302 を自動追従させない。
    // FANZA は無効 cid に対し 302 → now_printing.jpg にリダイレクトするため、
    // 302 が返ってきた時点で「画像なし」扱いにする。
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      redirect: "manual",
    });
    if (res.status !== 200) {
      return {
        ok: false,
        reason: `status=${res.status}`,
        ms: Date.now() - t0,
      };
    }
    const lenHeader = res.headers.get("content-length");
    const len = lenHeader ? Number.parseInt(lenHeader, 10) : NaN;
    // NOW PRINTING / プレースホルダ (~3KB) を弾く（追加防御）。
    if (Number.isFinite(len) && len > 0 && len < 15_000) {
      return {
        ok: false,
        reason: `header_size=${len}<15000`,
        ms: Date.now() - t0,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 15_000) {
      return {
        ok: false,
        reason: `body_size=${buf.byteLength}<15000`,
        ms: Date.now() - t0,
      };
    }
    const mime = res.headers.get("content-type") ?? "image/jpeg";
    return {
      ok: true,
      dataUri: `data:${mime};base64,${buf.toString("base64")}`,
      bytes: buf.byteLength,
      ms: Date.now() - t0,
    };
  } catch (err) {
    const reason =
      (err as { name?: string; message?: string }).name === "AbortError"
        ? `timeout_${FETCH_TIMEOUT_MS}ms`
        : `error:${(err as Error).message ?? "unknown"}`;
    return { ok: false, reason, ms: Date.now() - t0 };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const reqStart = Date.now();
  const reqUrl = new URL(request.url);
  const userAgent = request.headers.get("user-agent") ?? "";
  // Twitter / X クローラの判別ログ用。Twitterbot, facebookexternalhit など。
  const isBot =
    /Twitterbot|facebookexternalhit|LinkedInBot|Discordbot|Slackbot|TelegramBot/i.test(
      userAgent,
    );

  try {
    const cids = (reqUrl.searchParams.get("cids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    console.info(
      `[/api/og] start ua="${userAgent.slice(0, 80)}" isBot=${isBot} cids=${JSON.stringify(cids)}`,
    );

    // cids が一切無ければブランドフォールバック
    if (cids.length === 0) {
      console.info(`[/api/og] no_cids → brand fallback`);
      const img = new ImageResponse(<BrandFallback />, {
        ...SIZE,
        headers: CACHE_HEADERS,
      });
      console.info(
        `[/api/og] done variant=brand total_ms=${Date.now() - reqStart}`,
      );
      return img;
    }

    // 各画像を並列に取得。outcome に成否と所要時間を含めて全件ログ。
    const outcomes = await Promise.all(
      cids.map(async (cid) => ({
        cid,
        url: buildFanzaImageUrl(cid),
        result: await fetchImageOutcome(buildFanzaImageUrl(cid)),
      })),
    );

    // 全件の結果を 1 行ずつ出力 → Vercel Function Logs で原因特定可能。
    for (const o of outcomes) {
      if (o.result.ok) {
        console.info(
          `[/api/og] fetch ok cid=${o.cid} bytes=${o.result.bytes} ms=${o.result.ms}`,
        );
      } else {
        console.warn(
          `[/api/og] fetch fail cid=${o.cid} reason=${o.result.reason} ms=${o.result.ms} url=${o.url}`,
        );
      }
    }

    const validImages = outcomes
      .filter(
        (o): o is { cid: string; url: string; result: { ok: true; dataUri: string; bytes: number; ms: number } } =>
          o.result.ok,
      )
      .map((o) => o.result.dataUri);

    const okCount = validImages.length;
    const failCount = outcomes.length - okCount;
    console.info(
      `[/api/og] summary requested=${cids.length} ok=${okCount} fail=${failCount} timeout_ms=${FETCH_TIMEOUT_MS}`,
    );

    const img = new ImageResponse(<CompositeCard imageUris={validImages} />, {
      ...SIZE,
      headers: CACHE_HEADERS,
    });
    console.info(
      `[/api/og] done variant=composite imgs=${okCount} total_ms=${Date.now() - reqStart}`,
    );
    return img;
  } catch (err) {
    // 最後の砦: ImageResponse 自体で例外が出てもブランド画像を返して 200 を死守。
    console.error(
      `[/api/og] generation failed total_ms=${Date.now() - reqStart}:`,
      err,
    );
    try {
      return new ImageResponse(<BrandFallback />, {
        ...SIZE,
        headers: CACHE_HEADERS,
      });
    } catch {
      // それでもダメなら最小限の応答（X クローラは何も表示しないが 200 は返る）。
      return new Response("", {
        status: 200,
        headers: { ...CACHE_HEADERS, "content-type": "image/png" },
      });
    }
  }
}

function BrandFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(ellipse at top, #1a1a1a 0%, #000000 70%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 28,
          letterSpacing: 12,
          color: "#fbbf24",
          fontWeight: 600,
          marginBottom: 36,
        }}
      >
        PREMIUM VOD NAVIGATION
      </div>
      <div
        style={{
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: 8,
          color: "#fde68a",
          lineHeight: 1,
        }}
      >
        VODNAVI
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 36,
          color: "#fafafa",
          fontWeight: 500,
        }}
      >
        今夜の極上に、最短ルートで。
      </div>
    </div>
  );
}

function CompositeCard({ imageUris }: { imageUris: string[] }) {
  // 取得成功した画像のみで合成。0 件でもブランド要素だけで自然に成立するレイアウト。
  const hasImages = imageUris.length > 0;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(ellipse at top, #1a1a1a 0%, #000000 75%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* ブランド要素（左上に小さく） */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: 0.95,
        }}
      >
        <div
          style={{
            fontSize: 14,
            letterSpacing: 6,
            color: "#fbbf24",
            fontWeight: 600,
          }}
        >
          PREMIUM VOD
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#fde68a",
          }}
        >
          VODNAVI
        </div>
      </div>

      {/* タイトル */}
      <div
        style={{
          marginTop: hasImages ? 110 : 200,
          textAlign: "center",
          fontSize: hasImages ? 36 : 56,
          color: "#fde68a",
          fontWeight: 600,
          letterSpacing: 2,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {hasImages
          ? `AI コンシェルジュが選んだ今夜の${imageUris.length}本`
          : "AI コンシェルジュ厳選"}
      </div>

      {/* 画像 (1〜3 枚を中央寄せ) */}
      {hasImages && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginTop: 32,
            padding: "0 64px",
            flex: 1,
          }}
        >
          {imageUris.map((src, i) => (
            <div
              key={i}
              style={{
                width: 280,
                height: 374,
                display: "flex",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 0 40px -10px rgba(245,200,80,0.4)",
                border: "1px solid rgba(251,191,36,0.35)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                width={280}
                height={374}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* フッター URL */}
      <div
        style={{
          textAlign: "center",
          fontSize: 18,
          color: "#a1a1aa",
          letterSpacing: 4,
          marginBottom: 28,
          marginTop: hasImages ? 12 : "auto",
          paddingBottom: hasImages ? 0 : 56,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        app.vodnavi.jp / concierge
      </div>
    </div>
  );
}
