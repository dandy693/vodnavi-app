/**
 * vodnavi.jp — VODNAVI 公式ブランドサイト（site-brand）
 *
 * BRAND_DESIGN_GUIDE.md §3 ②「信頼の盾」準拠：
 *   - 広大なリッチブラック（#121212）の余白
 *   - プラチナホワイト本文 + シャンパンゴールドのアクセント
 *   - Apple 公式的なミニマル・テクノロジーデザイン
 *   - ヘッダー右上にゴールド「AI コンシェルジュを起動（無料）」を固定配置
 *   - 1 枚インフォグラフィック LP として運営情報・査読ポリシーを記載
 *
 * 役割：E-E-A-T を満たす「公式の顔」として、コンシェルジュ App への送客を担う。
 */

const CONCIERGE_URL = "https://app.vodnavi.jp/concierge?source=brand";

export default function BrandPage() {
  return (
    <>
      {/* ───── ヘッダー（固定動線） ───── */}
      <header className="sticky top-0 z-40 border-b border-brand-gold/10 bg-brand-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="font-luxury-heading text-base tracking-[0.3em] text-brand-text-primary sm:text-lg"
            aria-label="VODNAVI ホームへ"
          >
            VODNAVI
          </a>
          <a
            href={CONCIERGE_URL}
            className="btn-luxury-gold pulse-gold"
            aria-label="AI コンシェルジュを起動（無料）"
          >
            AI コンシェルジュを起動（無料）
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* ───── HERO ───── */}
        <section className="relative overflow-hidden border-b border-brand-gold/5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.12),transparent_70%)]"
          />
          <div className="mx-auto max-w-4xl px-6 py-32 text-center sm:py-40">
            <p className="font-luxury-heading text-xs tracking-[0.4em] text-brand-gold/80 sm:text-sm">
              VODNAVI · OFFICIAL
            </p>
            <h1 className="mt-8 font-luxury-heading text-4xl leading-tight text-brand-text-primary sm:text-6xl">
              次世代映像検索 <span className="whitespace-nowrap text-brand-gold">AI コンシェルジュ</span>
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-brand-text-secondary sm:text-lg">
              膨大な作品の海から、あなただけの一夜の一本を。
              VODNAVI は、AI による映像解析と、人間の専門家による厳格な査読体制で運営される、
              次世代のパーソナル・コンシェルジュ・サービスです。
            </p>
            <div className="mt-12">
              <a
                href={CONCIERGE_URL}
                className="btn-luxury-gold"
                aria-label="AI コンシェルジュを起動（無料）"
              >
                AI コンシェルジュを起動（無料）
              </a>
            </div>
          </div>
        </section>

        {/* ───── コンテンツ制作・査読ポリシー（E-E-A-T） ───── */}
        <section className="border-b border-brand-gold/5">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
              CONTENT POLICY
            </p>
            <h2 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
              AI と専門家による、ダブルチェック体制
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-brand-text-secondary sm:text-base">
              Google の E-E-A-T（Experience / Expertise / Authoritativeness / Trustworthiness）基準を上回る品質を担保するため、
              VODNAVI は次の三層の制作・査読フローを採用しています。
            </p>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              <PolicyPillar
                index="01"
                title="AI 映像解析"
                body="次世代マルチモーダル AI が、作品のジャンル・出演者・シチュエーション・情感を多角的に解析し、ユーザーの「今夜の気分」と最短距離で結びます。"
              />
              <PolicyPillar
                index="02"
                title="人間専門家の査読"
                body="AI の提案を、心理学・映像批評・コンプライアンスの三領域の専門家がダブルチェック。露骨な表現や規約違反の混入を構造的に排除します。"
              />
              <PolicyPillar
                index="03"
                title="プライバシー完全保護"
                box
                body="検索履歴・閲覧履歴はクライアント側に閉じ、第三者への送信は GA4 の匿名計測のみ。クレジットカード情報・個人情報は一切 VODNAVI を経由しません。"
              />
            </div>
          </div>
        </section>

        {/* ───── 運営組織情報 ───── */}
        <section className="border-b border-brand-gold/5">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
              ABOUT US
            </p>
            <h2 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
              運営組織情報
            </h2>

            <dl className="mt-14 grid gap-x-12 gap-y-6 sm:grid-cols-[180px_1fr]">
              <Row term="法人格" desc="合同会社トレンドネット" />
              <Row term="運営組織" desc="VODNAVI プロジェクト運営委員会（戦略・制作・コンプライアンスの 3 部門で構成）" />
              <Row term="代表サービス" desc="VODNAVI（vodnavi.jp）／VODNAVI Concierge（app.vodnavi.jp）／Moterist（moterist.com）" />
              <Row term="連絡先" desc="contact@vodnavi.jp（業務時間：平日 10:00–18:00 JST）" />
              <Row
                term="免責事項"
                desc="VODNAVI は VOD 作品の選定支援を行うサービスであり、配信プラットフォーム自体の運営者ではありません。最終的な視聴・購入・契約は、リンク先の公式サイト（FANZA 等）にて行われます。料金・配信状況・キャンペーン内容は変動するため、最新情報は必ず公式サイトでご確認ください。"
              />
              <Row
                term="広告表記"
                desc="当サイトは、アフィリエイト広告（FANZA 等）を含みます。広告収入はサービスの品質向上に充当されます。"
              />
            </dl>
          </div>
        </section>

        {/* ───── 最終 CTA ───── */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
            <h2 className="font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
              今夜、あなたの一本を。
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-brand-text-secondary sm:text-base">
              膨大なカタログから、あなた一人のために選ぶ AI コンシェルジュ。会話は数分で完結します。
            </p>
            <div className="mt-10">
              <a
                href={CONCIERGE_URL}
                className="btn-luxury-gold"
                aria-label="AI コンシェルジュを起動（無料）"
              >
                AI コンシェルジュを起動（無料）
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-gold/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-brand-text-secondary/70">
          © {new Date().getFullYear()} 合同会社トレンドネット / VODNAVI プロジェクト運営委員会 ·
          <span className="ml-2">広告を含む · 18 歳以上対象</span>
        </div>
      </footer>

      {/* 「明滅するゴールド」表現 — 控えめな pulse でラグジュアリーを保つ */}
      <style>{`
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 28px -4px rgba(212,175,55,0.55); }
        }
        .pulse-gold {
          animation: pulseGold 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-gold { animation: none; }
        }
      `}</style>
    </>
  );
}

function PolicyPillar({
  index,
  title,
  body,
  box,
}: {
  index: string;
  title: string;
  body: string;
  box?: boolean;
}) {
  return (
    <article
      className={
        box
          ? "rounded-2xl border border-brand-gold/20 bg-brand-surface/60 p-6"
          : "p-1"
      }
    >
      <p className="font-luxury-heading text-xs tracking-[0.3em] text-brand-gold">
        {index}
      </p>
      <h3 className="mt-3 font-luxury-heading text-lg text-brand-text-primary">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">
        {body}
      </p>
    </article>
  );
}

function Row({ term, desc }: { term: string; desc: string }) {
  return (
    <>
      <dt className="font-luxury-heading text-sm tracking-wide text-brand-gold">
        {term}
      </dt>
      <dd className="text-sm leading-relaxed text-brand-text-secondary">
        {desc}
      </dd>
    </>
  );
}
