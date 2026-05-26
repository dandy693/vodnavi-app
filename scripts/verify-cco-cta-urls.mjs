#!/usr/bin/env node
/**
 * CCO 執筆中の article.md に CTA URL のタイポ・破壊が紛れ込んでいないか検査する。
 *
 * 目的:
 *   ARTICLE_TEMPLATE.md §3.6 / §8 で「CTA URL は
 *   https://app.vodnavi.jp/concierge?source=moterist を短縮・改変禁止」と
 *   厳格化されている。?source=moterist が落ちると app-concierge 側の
 *   resolveConciergeSource() が default プロファイルにフォールバックし、
 *   流入元アトリビューションと専用 system addendum が崩壊する。
 *   タイポが本番公開後に発見されると GA4 のファネル計測も汚染される。
 *
 * 走らせ方:
 *   node scripts/verify-cco-cta-urls.mjs
 *   node scripts/verify-cco-cta-urls.mjs --strict   # 1 記事に最低 2 回出現を要求
 *
 * 戻り値:
 *   EXIT=0 - すべて健全
 *   EXIT=1 - 1 件以上のタイポ・破壊・不足を検出（CI / pre-commit で commit を弾く想定）
 *
 * 検出するアンチパターン:
 *   - URL が完全に欠落（CTA セクション自体が消えている）
 *   - ?source= の値が "moterist" 以外（タイポ・上書き）
 *   - クエリ文字列が欠落（?source なし）
 *   - 末尾スラッシュ・小文字違い・別ホスト混入
 *   - パーセントエンコード混入（&amp; / %3F 等）
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const REPO_ROOT = join(SELF, "..", "..");
const CONTENT_DIR = join(REPO_ROOT, "site-moterist", "03_content");
const CANONICAL_CTA = "https://app.vodnavi.jp/concierge?source=moterist";

const args = new Set(process.argv.slice(2));
const STRICT = args.has("--strict");

// 5 大スラグ。今後拡張する場合はここに追加するだけで audit 対象に入る。
// glob を avoid して明示列挙する: 「audit 対象として登録した」明示性を保つ。
const TARGET_SLUGS = [
  "emotion-broken-heart-rescue",
  "emotion-sleepless-indulgence",
  "wisdom-madness-aesthetic",
  "wisdom-taboo-history",
  "situation-solitude-night",
];

// 検出するアンチパターン群（カノニカル URL に「似ているが間違っている」フォーム）。
const ANTIPATTERNS = [
  { rx: /\?source=moterist[a-zA-Z0-9_-]+/g, label: "source 値の末尾汚染 (?source=moteristxxx)" },
  { rx: /\?source=[A-Z][a-zA-Z]+/g, label: "source 値の大文字化 (?source=Moterist 等)" },
  { rx: /https?:\/\/app\.vodnavi\.jp\/concierge(?!\?source=moterist)/g, label: "?source=moterist を欠いた CTA URL" },
  { rx: /\?source=moterist&amp;/g, label: "& の HTML 二重エンコード混入" },
  { rx: /vodnavi\.app\/concierge/g, label: "ホスト名タイポ (vodnavi.app)" },
  { rx: /apps?\.vodnavi\.jp\/concierge/gi, label: "ホスト名タイポ (apps.vodnavi.jp)" },
  { rx: /app\.vodnavi\.com\/concierge/g, label: "TLD タイポ (.com)" },
  { rx: /\/concierge\/\?source/g, label: "余分なスラッシュ (/concierge/?source)" },
];

let totalArticles = 0;
let failures = 0;
const violations = [];

function check(slug) {
  const articlePath = join(CONTENT_DIR, slug, "article.md");
  let body;
  try {
    body = readFileSync(articlePath, "utf8");
  } catch (err) {
    violations.push({ slug, kind: "missing_file", detail: String(err.message ?? err) });
    failures++;
    return;
  }
  totalArticles++;

  // ① canonical URL の出現回数を数える
  const canonicalMatches = body.match(new RegExp(escapeRegex(CANONICAL_CTA), "g"));
  const canonicalCount = canonicalMatches ? canonicalMatches.length : 0;

  if (canonicalCount === 0) {
    violations.push({
      slug,
      kind: "canonical_missing",
      detail: `canonical CTA URL が 1 件も検出されない`,
    });
    failures++;
  } else if (STRICT && canonicalCount < 2) {
    // テンプレ §3.4 中間導線 + §3.6 末尾 CTA の 2 箇所必須
    violations.push({
      slug,
      kind: "canonical_underpopulated",
      detail: `--strict: canonical 出現 ${canonicalCount} 件 (中間導線 + 末尾 CTA で 2 件以上想定)`,
    });
    failures++;
  }

  // ② アンチパターンに引っかかるものを全列挙
  for (const ap of ANTIPATTERNS) {
    const hits = body.match(ap.rx);
    if (hits && hits.length > 0) {
      // canonical URL を「アンチパターンに似ている」と誤検出する場合があるため
      // canonical 自体は明示的に除外する（rx が canonical を含む可能性のみ排除）。
      const realHits = hits.filter((h) => !CANONICAL_CTA.includes(h) && h !== CANONICAL_CTA);
      if (realHits.length > 0) {
        violations.push({
          slug,
          kind: "antipattern",
          detail: `${ap.label}: ${JSON.stringify(realHits.slice(0, 3))}`,
        });
        failures++;
      }
    }
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

console.log(`[verify-cco-cta-urls] start (strict=${STRICT})`);
console.log(`  canonical CTA URL = ${CANONICAL_CTA}`);
console.log("");

for (const slug of TARGET_SLUGS) {
  check(slug);
}

console.log(`scanned ${totalArticles}/${TARGET_SLUGS.length} article.md`);
if (violations.length === 0) {
  console.log(`[verify-cco-cta-urls] ALL PASS`);
  process.exit(0);
}

console.log(`[verify-cco-cta-urls] FAILED with ${violations.length} violation(s):`);
for (const v of violations) {
  console.log(`  ! ${v.slug}: [${v.kind}] ${v.detail}`);
}
process.exit(1);
