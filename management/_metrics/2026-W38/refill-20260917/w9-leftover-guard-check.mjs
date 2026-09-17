// W9-01 / W9-15（8/29 障害の残置ストック）の再割当可否を、書き込まずにガード21件で検査する（報告用・dry）。
import { readFileSync } from "node:fs";
import { runGuardsAsync } from "../../../../app-concierge/scripts/x-post-generator.mjs";
const dump = JSON.parse(readFileSync(process.argv[2], "utf8")).records;
const existing = dump.map((r) => ({ linkUrl: r.fields?.["リンクURL"] ?? null, scheduledUtc: r.fields?.["予約日時"] ?? null }));
const row = (name) => dump.find((r) => r.fields["管理ID"]?.startsWith(name));
const w901 = row("W9-01"), w915 = row("W9-15");
const text901 = process.argv[3], text915 = process.argv[4];
const cases = [
  { label: "W9-01 → 2026-09-25 21:00", post: { name: w901.fields["管理ID"], kind: "T1", recordId: w901.id, text: text901, linkUrl: w901.fields["リンクURL"], contentId: "sone00682", hinban: "SONE-682", actressNames: ["瀬戸環奈"], scheduledUtc: "2026-09-25T12:00:00.000Z", intendedJst: "2026-09-25 21:00", referenceJstDate: "2026-09-17", status: "ストック" } },
  { label: "W9-15 → 2026-09-18 22:30", post: { name: w915.fields["管理ID"], kind: "TG", recordId: w915.id, text: text915, linkUrl: w915.fields["リンクURL"], articleSlug: "fanza-first-guide", scheduledUtc: "2026-09-18T13:30:00.000Z", intendedJst: "2026-09-18 22:30", referenceJstDate: "2026-09-17", status: "ストック" } },
];
for (const c of cases) {
  const { pass, failures } = await runGuardsAsync([c.post], existing);
  console.log(JSON.stringify({ label: c.label, pass, failures }));
}
