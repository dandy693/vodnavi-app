// twitter-image は opengraph-image と同じ生成ロジックを使う（再エクスポート）。
// これで <meta name="twitter:image" ...> が独立して生成され、Twitter / X 上で
// summary_large_image カードが確実に展開される。
export { default, alt, size, contentType } from "./opengraph-image";
