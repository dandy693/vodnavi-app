import fs from "node:fs";
import { checkStop, normalizeTargets, normalizeReplies } from "file:///C:/Users/Tachi/projects/VODNAVI-GROUP/management/tools/x-reply-drafts/generate.mjs";
const [parsedPath, targetsPath, repliesPath, today, outPath] = process.argv.slice(2);
const parsed = JSON.parse(fs.readFileSync(parsedPath, "utf8"));
const targets = normalizeTargets(JSON.parse(fs.readFileSync(targetsPath, "utf8")));
const replies = normalizeReplies(JSON.parse(fs.readFileSync(repliesPath, "utf8")));
const config = JSON.parse(fs.readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/management/tools/x-reply-drafts/guards.config.json", "utf8"));
const now = new Date(`${today}T12:00:00+09:00`);
const rows = [];
for (const l of parsed.lines) {
  if (!l.ok) continue;
  const t = targets.find((x) => x.handle.toLowerCase() === l.handle.toLowerCase()) ?? null;
  const stop = t ? checkStop({ line: l, target: t, replies, now, config }) : "対象外（x_targets に無い）";
  rows.push({ lineNo: l.lineNo, handle: l.handle, postedAtJst: l.postedAtJst, postUrl: l.postUrl, type: t?.type ?? null, status: t?.status ?? null, last_reply_at: t?.last_reply_at ?? null, work: l.work?.contentId ?? l.work?.hinban ?? null, stop });
}
fs.writeFileSync(outPath, JSON.stringify({ _note: "generate.mjs の checkStop を全行に適用（API 呼び出しなし・本文は含めない）", today, rows }, null, 2) + "\n");
for (const r of rows) console.log(String(r.lineNo).padStart(2), r.handle.padEnd(16), r.postedAtJst, r.type ?? "-", r.stop ?? "OK");
