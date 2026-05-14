export type ConciergeSource = "default" | "moterist" | "brand";

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
