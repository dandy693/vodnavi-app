export type ConciergeSource =
  | "default"
  | "moterist"
  | "brand"
  | "app_detail"
  | "sns_x";

export interface ConciergeSourceProfile {
  id: ConciergeSource;
  greeting: string;
  systemAddendum: string;
}

const DEFAULT_GREETING =
  "ようこそ。VODNAVI のコンシェルジュです。今夜のお気持ち、教えていただけますか。\n\n「疲れた一日を癒したい」「ふと刺激が欲しくなった」「久しぶりに濃いものを観たい」── 一言で構いません。最適な一本をお選びいたします。";

const MOTERIST_GREETING =
  "Moterist の記事から、いらしてくださったのですね。お読みいただきありがとうございます。\n\nあの記事のテーマは、ここから先のあなたの夜に静かに繋がっています。今夜のお気持ちを一言、お聞かせください。";

const BRAND_GREETING =
  "VODNAVI 公式から、いらっしゃいませ。コンシェルジュをご指名いただき光栄です。\n\nまずは今夜の気分から伺いましょう。「癒し」「刺激」「没入」── どの方向でも、的確に一本お選びいたします。";

const APP_DETAIL_GREETING =
  "別の作品をお探しですね。お読みいただいた一本、ご覧くださりありがとうございます。\n\nあの作品の余韻を踏まえて、似た気配のもの、あるいは少し違う扉── どちらでもご案内いたします。今夜のお気持ちを一言、お聞かせください。";

const SNS_X_GREETING =
  "X からの一篇、お読みくださりありがとうございます。ようこそ、官能の図書館へ。\n\nあの投稿の知的な余韻のまま、今夜のお気持ちを一言お聞かせください。あなたの感性に静かにシンクロする一本を、プライベートにお選びいたします。";

const PROFILES: Record<ConciergeSource, ConciergeSourceProfile> = {
  default: {
    id: "default",
    greeting: DEFAULT_GREETING,
    systemAddendum: "",
  },
  moterist: {
    id: "moterist",
    greeting: MOTERIST_GREETING,
    systemAddendum:
      "【流入コンテキスト】このユーザーは moterist.com（心理学・教養系のメディア）の記事から流入しています。知的な比喩や情景描写を、いつもより一段だけ深くしてかまいません。記事の余韻を壊さないよう、最初の応答は静かに受け止める姿勢を強めてください。",
  },
  brand: {
    id: "brand",
    greeting: BRAND_GREETING,
    systemAddendum:
      "【流入コンテキスト】このユーザーは vodnavi.jp（公式ブランドサイト）からの来訪です。コンシェルジュ体験の信頼性・選定の確かさを、最初の一本でしっかり示してください。提案の根拠を一言だけ丁寧に添えると効果的です。",
  },
  app_detail: {
    id: "app_detail",
    greeting: APP_DETAIL_GREETING,
    systemAddendum:
      "【流入コンテキスト】このユーザーは app.vodnavi.jp の作品詳細ページ (/works/[floor]/[id]) を読了した上でコンシェルジュへ流入しています。直前に閲覧した作品の輪郭は把握済みである前提で、「同じ路線で別の一本」「あえて気分を切り替えた一本」のどちらが良いかを最初の一往復で柔らかく確かめてください。再推薦の文脈なので、初手は『別の作品をお探しですね』に近い、再来訪を歓迎する姿勢で受け止めてください。",
  },
  sns_x: {
    id: "sns_x",
    greeting: SNS_X_GREETING,
    systemAddendum:
      "【流入コンテキスト】このユーザーは X（旧Twitter）の教養レンズ系ポストから流入しています。チープな直接的アダルト表現は避け、映画批評・心理学的アプローチの格調を保ってください。成人向け作品（FANZA）の提示は、サーバー側の年齢確認ゲート（proxy.ts）通過が前提であり、その上で上品に商品カードを案内してください。",
  },
};

export function resolveConciergeSource(
  raw: string | undefined | null,
): ConciergeSourceProfile {
  if (!raw) return PROFILES.default;
  if (Object.prototype.hasOwnProperty.call(PROFILES, raw)) {
    return PROFILES[raw as ConciergeSource];
  }
  return PROFILES.default;
}
