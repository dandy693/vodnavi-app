import genresEditorialData from "@/data/genres-editorial.json";

/**
 * FACTOR_B 受け皿 — ジャンルごとの編集リード文。works-editorial.ts と対称構造。
 * /genres/[id] ページの本文が「タイトル + 件数」のみで極薄なため、
 * CCO が手書きで投入する Information Gain 段落をここから配信する。
 *
 * `data/genres-editorial.json` には初期モックを置かない。
 * CCO が FANZA 売上上位ジャンルから先行投入する。
 */
export type GenreEditorial = {
  /** H1 直下に表示される 300〜500 字の編集リード。 */
  editorialLead?: string;
  /** 感情アーキタイプ。works editorial と同じ語彙を使う。 */
  emotionalArchetype?: string;
};

export type GenresEditorialMap = Record<string, GenreEditorial>;

const editorial = genresEditorialData as GenresEditorialMap;

export function getGenreEditorial(genreId: string): GenreEditorial | undefined {
  const entry = editorial[genreId];
  if (!entry?.editorialLead) return undefined;
  return entry;
}
