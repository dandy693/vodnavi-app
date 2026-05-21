import worksEditorialData from "@/data/works-editorial.json";

/**
 * FACTOR_B 受け皿 — 作品ごとの編集リード文。
 * STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED.md の方針に従い、
 * CCO が手書きで投入する Information Gain 段落を、UI 層から型安全に参照する。
 *
 * 重要：本ファイルとセットの `data/works-editorial.json` には **モックデータを置かない**。
 * 実コンテンツ（FANZA 売上上位から先行 30 件）は CCO が個別に追加する。
 */
export type WorkEditorial = {
  /** H1 直下に表示される 200〜400 字の編集リード。FANZA 本家にない VODNAVI 独自視点。 */
  editorialLead?: string;
  /** 感情アーキタイプ（例: "lonely-night-curator", "premium-vr-purist"）。将来の出し分けに使用。 */
  emotionalArchetype?: string;
  /** 内部分類（例: "premium-vr", "kimono-mature", "amateur-realdoc"）。将来の関連リコメンドに使用。 */
  genreFamily?: string;
};

export type WorksEditorialMap = Record<string, WorkEditorial>;

const editorial = worksEditorialData as WorksEditorialMap;

/**
 * 作品 content_id に紐付く編集リードを取得する。
 * 未登録の場合は undefined を返す（page.tsx 側で optional 描画）。
 */
export function getWorkEditorial(contentId: string): WorkEditorial | undefined {
  const entry = editorial[contentId];
  if (!entry?.editorialLead) return undefined;
  return entry;
}
