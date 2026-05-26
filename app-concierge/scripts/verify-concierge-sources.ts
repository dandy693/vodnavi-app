/**
 * GA4 クロスドメインリンカー疎通の前提となる `?source=` 値域の生存確認スクリプト。
 *
 * 目的:
 *   moterist.com → app.vodnavi.jp/concierge?source=moterist の遷移で、
 *   `source=moterist` がサーバ側で正規 ConciergeSource として受け取られ、
 *   moterist 専用 greeting / system addendum に分岐することを構造的に保証する。
 *
 * 走らせ方:
 *   cd app-concierge && node --experimental-strip-types scripts/verify-concierge-sources.ts
 *
 * 失敗時の意味:
 *   どこかのコミットで sources.ts の ConciergeSource union から "moterist" が
 *   外れたか、resolveConciergeSource() が大文字小文字や前後空白を許容するように
 *   緩んだか。いずれも CCO 記事公開時に流入元アトリビューションが壊れる。
 */

import { resolveConciergeSource } from "../src/lib/concierge/sources.ts";

let failed = 0;
function check(label: string, cond: boolean, detail = ""): void {
  if (cond) {
    console.log(`  PASS  ${label}${detail ? ` (${detail})` : ""}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` (${detail})` : ""}`);
  }
}

console.log("[verify-concierge-sources] start");

// 1. moterist は正規値として profile.id を返す
const moterist = resolveConciergeSource("moterist");
check(
  "moterist が正規 profile に解決される",
  moterist.id === "moterist",
  `got id=${moterist.id}`,
);
check(
  "moterist の greeting が moterist 専用文面を含む",
  moterist.greeting.includes("Moterist の記事"),
);
check(
  "moterist の systemAddendum が moterist.com を言及する",
  moterist.systemAddendum.includes("moterist.com"),
);

// 2. 4 つの正規 ConciergeSource すべてが解決可能
for (const src of ["default", "moterist", "brand", "app_detail"] as const) {
  const p = resolveConciergeSource(src);
  check(`正規 source "${src}" が解決可能`, p.id === src, `got id=${p.id}`);
}

// 3. 不正値は default にフォールバックする (フェイルセーフ)
const unknownCases = [
  "MOTERIST", // 大文字
  "moterist ", // 末尾空白
  " moterist", // 先頭空白
  "moter1st", // タイポ
  "__proto__", // prototype pollution の試み
  "constructor", // 同上
  "<script>", // XSS の試み
  "",
];
for (const bad of unknownCases) {
  const p = resolveConciergeSource(bad);
  check(
    `不正値 ${JSON.stringify(bad)} は default にフォールバック`,
    p.id === "default",
    `got id=${p.id}`,
  );
}

// 4. null / undefined も安全に default へ
check(
  "null は default にフォールバック",
  resolveConciergeSource(null).id === "default",
);
check(
  "undefined は default にフォールバック",
  resolveConciergeSource(undefined).id === "default",
);

console.log(
  `[verify-concierge-sources] ${failed === 0 ? "ALL PASS" : `FAILED ${failed}`}`,
);
if (failed > 0) process.exit(1);
