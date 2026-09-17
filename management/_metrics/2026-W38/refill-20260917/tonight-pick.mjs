// 今夜分 1 本（CSO 指示 2026-09-17 22:0x）: プール先頭（直近配信 9/16）を 23:00 JST 枠へ充て、ガード21件を再実行して payload を作る。書き込みは MCP。
import { readFileSync, writeFileSync } from "node:fs";
import { runGuardsAsync } from "../../../../app-concierge/scripts/x-post-generator.mjs";
const D = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const pool = JSON.parse(readFileSync(`${D}/tonight-pool-20260917.json`, "utf8")).posts;
const dump = JSON.parse(readFileSync(`${D}/posts_dump_20260917_after.json`, "utf8")).records;
const existing = dump.map((r) => ({ linkUrl: r.fields?.["リンクURL"] ?? null, scheduledUtc: r.fields?.["予約日時"] ?? null }));
const src = pool[0];
const post = { ...src, id: "W11-08", name: `W11-08 T1改 ${src.actressNames[0]} ${src.hinban}`, scheduledUtc: "2026-09-17T14:00:00.000Z", intendedJst: "2026-09-17 23:00" };
const { pass, failures } = await runGuardsAsync([post], existing);
console.log(JSON.stringify({ tag: "TONIGHT_GUARD", ts: new Date().toISOString(), name: post.name, template: post.template, pass, failures }));
if (!pass) process.exit(1);
const rec = { fields: {
  fldSFgqqf40w8D2hQ: post.name, fldFMfnZXxnhSviDr: post.text, fldWn1DLzKGacDC26: "T1改", fldiGogHs9F7w5t2q: "ストック",
  fldkk8CfCKXyqPNFO: post.linkUrl, fldohCPGnEjkTQRV6: "サイト",
  fldne3ecIJaK6KRmA: `CSO 指示 2026-09-17 22:0x(緊急・今夜分 1 本)／想定枠 ${post.intendedJst} JST／ガード21件 PASS(生成時 2026-09-17)／テンプレート ${post.template}／予約日時は承認時に設定する`,
} };
writeFileSync(`${D}/tonight-create-payload.json`, JSON.stringify({ post, records: [rec] }, null, 1));
console.log(JSON.stringify(rec.fields));
