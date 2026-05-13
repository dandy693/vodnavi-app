/**
 * URL に utm_source などのトラッキングパラメータを付与する小道具。
 * 既に同名パラメータが存在する場合は重複を避ける。
 */
export function withUtm(url: string, source: string): string {
  if (!url) return url;
  if (/[?&]utm_source=/.test(url)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=${encodeURIComponent(source)}`;
}
