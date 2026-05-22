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

// FANZA サムネは Vercel Image Optimization の月次枠を喰い切るため
// パススルーし、Vercel の /_next/image を経由させない。
export const fanzaPassthroughLoader: ImageLoader = ({ src }) => src;

export function FanzaImage(props: ImageProps) {
  if (isFanzaImageSrc(props.src)) {
    return (
      <NextImage
        {...props}
        loader={props.loader ?? fanzaPassthroughLoader}
        unoptimized
      />
    );
  }
  return <NextImage {...props} />;
}
