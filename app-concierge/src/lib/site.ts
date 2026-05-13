/**
 * サイトの公開 URL を解決する。優先順:
 *   1. NEXT_PUBLIC_SITE_URL（明示設定）
 *   2. VERCEL_PROJECT_PRODUCTION_URL（Vercel が自動付与する正規本番URL）
 *   3. VERCEL_URL（プレビュー含むデプロイ毎のURL）
 *   4. http://localhost:3000（dev）
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prodUrl) return `https://${prodUrl}`;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

const TRIM_REGEX = /[　\s]+/g;

/**
 * 商品タイトルから SEO 用の短縮タイトルを作成。改行・全角空白を整える。
 */
export function compactTitle(title: string, max = 60): string {
  const cleaned = title.replace(TRIM_REGEX, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

/**
 * メタ description に使う本文を最大長で打ち切り。
 */
export function compactDescription(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}
