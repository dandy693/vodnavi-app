import NextImage, { type ImageLoader, type ImageProps } from "next/image";

const FANZA_IMAGE_HOSTS = new Set([
  "pics.dmm.co.jp",
  "pics.dmm.com",
  "awsimgsrc.dmm.co.jp",
  "p1.dmm.co.jp",
  "doc.dmm.co.jp",
]);

export function isFanzaImageSrc(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;
  try {
    return FANZA_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

// クライアント側で明示的に loader を差し込みたい場合のみ使用する。
// 既定では FanzaImage は `unoptimized` のみ付与し、Server Component 経由でも
// 関数プロップを RSC 境界に漏らさない（Next.js は関数の直接渡しを禁止する）。
export const fanzaPassthroughLoader: ImageLoader = ({ src }) => src;

export function FanzaImage(props: ImageProps) {
  if (isFanzaImageSrc(props.src)) {
    return <NextImage {...props} unoptimized />;
  }
  return <NextImage {...props} />;
}
