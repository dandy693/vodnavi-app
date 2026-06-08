// vodnavi.jp clean 境界の build 前自動強制 (BRIEF_050 §3 / T-20260608-04)。
// site-brand/03_content/**/*.md に「成人/FANZA アフィリエイト signal」が無いか検査し、
// 1 件でも検出したら exit 1 で build を止める（人手レビューに頼らず境界を機械強制）。
//
// 検出時の方針: vodnavi.jp は clean 集客面。成人作品/affiliate 動線は app.vodnavi.jp
// 年齢ゲート内に隔離する（BRIEF_034 §4 / 049）。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// scripts/ の 1 つ上 = site-brand/ 。その直下の 03_content を見る。
const CONTENT_DIR = path.resolve(__dirname, "../03_content");

const BANNED = [
  { re: /al\.dmm\.co\.jp/i, why: "FANZA アフィリエイト link ドメイン" },
  { re: /[?&]af_id=/i, why: "FANZA アフィリエイト ID パラメータ" },
  { re: /fanza/i, why: "成人プラットフォーム名 (clean 面では非掲載)" },
  { re: /成人向け/, why: "成人向け明示ワード" },
];

function collectMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

console.log(`[clean-lint] scanning ${CONTENT_DIR}`);
if (!fs.existsSync(CONTENT_DIR)) {
  console.log(`[clean-lint] no content dir; nothing to check.`);
  process.exit(0);
}

const files = collectMarkdown(CONTENT_DIR);
let violations = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const { re, why } of BANNED) {
    const m = content.match(re);
    if (m) {
      violations++;
      console.error(
        `[clean-lint] VIOLATION: ${path.relative(process.cwd(), file)} — "${m[0]}" (${why})`,
      );
    }
  }
}

if (violations > 0) {
  console.error(
    `\n[clean-lint] BUILD BLOCKED: ${violations} clean-boundary violation(s). ` +
      `vodnavi.jp は非成人のみ。成人/FANZA 動線は app.vodnavi.jp 年齢ゲート内へ。`,
  );
  process.exit(1);
}
console.log(`[clean-lint] PASS: ${files.length} file(s) clean.`);
process.exit(0);
