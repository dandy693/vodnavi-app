import actressesEditorialData from "@/data/actresses-editorial.json";

/**
 * 女優ごとの編集リード文。genre-editorial.ts / works-editorial.ts と対称構造。
 * /actresses/[id] ページの本文が「タイトル + 件数」のみで極薄（504 クロール済み-未登録）
 * になるのを避けるため、CCO が手書きする Information Gain 段落をここから配信する。
 *
 * `data/actresses-editorial.json` には初期モックを置かない（空 {}）。
 * CCO が GSC 需要上位の女優から先行投入する（status は本ファイルでは扱わず、
 * editorialLead が入った時点で公開＝描画される）。
 */
export type ActressEditorial = {
  /** H1 直下に表示される 300〜500 字の編集リード。 */
  editorialLead?: string;
  /** 感情アーキタイプ。genre / works editorial と同じ語彙を使う。 */
  emotionalArchetype?: string;
};

export type ActressesEditorialMap = Record<string, ActressEditorial>;

const editorial = actressesEditorialData as ActressesEditorialMap;

export function getActressEditorial(
  actressId: string,
): ActressEditorial | undefined {
  const entry = editorial[actressId];
  if (!entry?.editorialLead) return undefined;
  return entry;
}
