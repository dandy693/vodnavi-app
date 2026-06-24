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
  /** アンカーテキスト用の実名（MD 由来 + 本番 <title> 物理抽出で populate）。 */
  name?: string;
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

/**
 * フッター等のリンククラウド用。実名 (`name`) が populate 済みの女優だけを
 * `{ id, name }` 配列で返す。JSON の拡張に 100% 追従する（手動列挙はしない）。
 */
export function getActressLinks(): { id: string; name: string }[] {
  return Object.entries(editorial)
    .filter(
      (entry): entry is [string, ActressEditorial & { name: string }] =>
        typeof entry[1].name === "string" && entry[1].name.length > 0,
    )
    .map(([id, v]) => ({ id, name: v.name }));
}
