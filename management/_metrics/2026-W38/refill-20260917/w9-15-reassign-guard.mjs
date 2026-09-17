// CSO裁定 2026-09-17 22:5x: W9-15 を 9/25（金）21:00 でガード再実行し PASS なら割当。
import { readFileSync } from "node:fs";
import { runGuardsAsync } from "../../../../app-concierge/scripts/x-post-generator.mjs";
const dump = JSON.parse(readFileSync(process.argv[2], "utf8")).records;
const existing = dump.map((r) => ({ linkUrl: r.fields?.["リンクURL"] ?? null, scheduledUtc: r.fields?.["予約日時"] ?? null }));
const w915 = dump.find((r) => r.fields["管理ID"]?.startsWith("W9-15"));
const post = { name: w915.fields["管理ID"], kind: "TG", recordId: w915.id, text: process.argv[3], linkUrl: w915.fields["リンクURL"], articleSlug: "fanza-first-guide", scheduledUtc: "2026-09-25T12:00:00.000Z", intendedJst: "2026-09-25 21:00", referenceJstDate: "2026-09-17", status: "ストック" };
const { pass, failures } = await runGuardsAsync([post], existing);
console.log(JSON.stringify({ tag: "W9-15_REASSIGN_GUARD", ts: new Date().toISOString(), recordId: w915.id, slot: post.intendedJst, pass, failures }));
