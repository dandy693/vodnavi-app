#!/usr/bin/env node
/**
 * generate-seo-robots.mjs
 *
 * mixhost (moterist.com) のドキュメントルート直下に設置する `robots.txt` を
 * 単一情報源としてリポジトリ内で生成する。WordPress の自動 robots.txt は
 * /wp-admin/ しか除外しないため、クロールバジェットの無駄遣いと低品質 URL
 * インデックス（/?s= サーチ結果、/?p= 短縮 URL、フィード、author/tag archive
 * 等）を構造的に遮断するため、物理 robots.txt をデプロイで上書きする。
 *
 * 使い方:
 *   node site-moterist/scripts/generate-seo-robots.mjs
 *     → ./dist/robots.txt を生成 (デフォルト)
 *   node site-moterist/scripts/generate-seo-robots.mjs --out /var/www/html/robots.txt
 *     → 指定パスに出力 (mixhost SSH 経由のデプロイ等)
 *
 * 冪等性: 同じ入力に対して常に同じバイト列を出力する（trailing newline 込み）。
 * 既存ファイルがあれば diff 一致なら no-op、差分があれば上書き + EXIT 0。
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_HOST = "moterist.com";

// 出力 robots.txt の正典本文。順序・スペース・空行も含めて固定。
// 仕様根拠: 2026-05-25 緊急 SEO テクニカル監査（ALERTS.md 同日エントリ）。
const ROBOTS_TXT = `User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /author/
Disallow: /tag/
Disallow: /?s=
Disallow: /?p=
Disallow: /feed/
Disallow: /comments/feed/

Sitemap: https://${SITE_HOST}/wp-sitemap.xml
`;

function parseArgs(argv) {
  const args = { out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out" && argv[i + 1]) {
      args.out = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const here = dirname(fileURLToPath(import.meta.url));
  const defaultOut = resolve(here, "..", "dist", "robots.txt");
  const outPath = args.out ? resolve(args.out) : defaultOut;

  let existing = null;
  try {
    existing = await readFile(outPath, "utf8");
  } catch (e) {
    if (e?.code !== "ENOENT") throw e;
  }

  if (existing === ROBOTS_TXT) {
    console.log(`[generate-seo-robots] no-op: ${outPath} already matches canon`);
    return;
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, ROBOTS_TXT, "utf8");
  console.log(
    `[generate-seo-robots] wrote ${ROBOTS_TXT.length} bytes -> ${outPath}`,
  );
}

main().catch((err) => {
  console.error("[generate-seo-robots] FATAL:", err);
  process.exit(1);
});
