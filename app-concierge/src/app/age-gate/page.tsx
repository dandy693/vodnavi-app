import { AgeGateModal } from "./age-gate-modal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "年齢確認 | VODNAVI",
  description: "VODNAVI コンシェルジュをご利用いただく前に、18 歳以上であることをご確認ください。",
  robots: { index: false, follow: false },
};

type AgeGateSearchParams = {
  next?: string;
};

export default async function AgeGatePage({
  searchParams,
}: {
  searchParams: Promise<AgeGateSearchParams>;
}) {
  const params = await searchParams;
  // `next` の安全化：内部パスのみ許可（オープンリダイレクト対策）。
  // 先頭が `/` で、かつ `//` から始まらないものだけ通す。それ以外は /concierge にフォールバック。
  const raw = params.next ?? "/concierge";
  const safeNext =
    raw.startsWith("/") && !raw.startsWith("//") ? raw : "/concierge";

  return <AgeGateModal next={safeNext} />;
}
