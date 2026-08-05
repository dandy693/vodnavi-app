/**
 * editorial_articles / article_products リーダー（BRIEF_085 §4・BRIEF_086 §4）。
 *
 * 公開境界（多重防御）:
 *   - SELECT は常に `publish_status = 'published'` を明示。service_role は RLS を
 *     バイパスするため、ここで明示フィルタしないと draft/review が公開面に漏れる。
 *   - 製品リンクは published 記事に紐づく行のみ。
 *
 * ID 抽象化遵守:
 *   - `article_products` は af_id 入り URL を保存しない（content_id / asp_name / display_order のみ）。
 *     CTA URL は描画時に `lib/concierge/url-builder` で env から実行時生成する
 *     （[[reference_dmm_affiliate_id_registry]] / BRIEF_085 付録A 注）。
 *
 * スキーマ前提（実適用 DDL = vodnavi-production ライブに同期。2026-06-30 に
 * information_schema.columns を物理再確認し列名を確定:
 *   editorial_articles = id/title/slug/description/pillar/publish_status + body(純加算列)
 *   article_products   = content_id/asp_name/display_order
 * 万一列名が異なれば SELECT が error → null を返し、呼び出し側で notFound に
 * 落ちる＝ローカル/不整合でも crash しない）。
 */
import { getServiceRoleClient } from "@/lib/supabase/server";

export interface EditorialArticleProduct {
  content_id: string;
  asp_name: string;
  display_order: number;
  /**
   * 表示用の作品タイトル（2026-08-05 CSO承認で追加した nullable 列）。
   * NULL の場合はレンダラが `content_id` へフォールバックする＝列を足しただけの
   * 段階では従前と完全に同じ出力になる（フェイルセーフ）。
   * FANZA API から都度取得すると作品数だけ呼び出しが増えるため、保存値を使う。
   */
  title: string | null;
}

export interface EditorialArticle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  body: string | null;
  products: EditorialArticleProduct[];
}

/**
 * published 記事を slug で 1 件取得（紐づく製品を display_order 昇順で同梱）。
 * 未配線 / 未発見 / 取得エラーはいずれも null（呼び出し側で notFound）。
 */
export async function getPublishedArticleBySlug(
  slug: string,
): Promise<EditorialArticle | null> {
  const supabase = getServiceRoleClient();
  if (!supabase) return null;

  const { data: article, error } = await supabase
    .from("editorial_articles")
    .select("id, title, slug, description, body")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .maybeSingle();

  if (error || !article) return null;
  const a = article as Omit<EditorialArticle, "products">;

  const { data: products } = await supabase
    .from("article_products")
    .select("content_id, asp_name, display_order, title")
    .eq("article_id", a.id)
    .order("display_order", { ascending: true });

  return {
    ...a,
    products: (products as EditorialArticleProduct[] | null) ?? [],
  };
}

/**
 * published 記事の slug 一覧（sitemap / 任意の事前生成用）。
 * 未配線 / エラーは空配列。
 */
export async function getPublishedArticleSlugs(limit = 1000): Promise<string[]> {
  const supabase = getServiceRoleClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("editorial_articles")
    .select("slug")
    .eq("publish_status", "published")
    .limit(limit);

  if (error || !data) return [];
  return (data as { slug: string }[]).map((r) => r.slug);
}
