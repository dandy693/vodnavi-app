// drafts.json を人が読む形で出す（着地報告用）
import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
console.log(`model=${d.model} dry_run=${d.dry_run} today_jst=${d.today_jst} counts=${JSON.stringify(d.counts)} prompt_sha=${d.system_prompt_sha256.slice(0, 12)}`);
for (const it of d.items) {
  console.log(`\n=== @${it.handle} (${it.target?.type ?? "?"}) status=${it.status} replyKey=${it.replyKey} calls=${it.usage.calls} in=${it.usage.input_tokens} out=${it.usage.output_tokens}`);
  for (const w of it.warnings ?? []) console.log(`  ! ${w}`);
  for (const t of ["A", "B", "C"]) {
    const x = it.drafts?.[t];
    if (!x) { console.log(`  ${t}: (なし${it.types && !it.types.includes(t) ? "・知識なしモードでは B を生成しない" : ""})`); continue; }
    console.log(`  ${t} chars=${x.guard.metrics.chars} weight=${x.guard.metrics.weight} ok=${x.guard.ok} attempts=${x.attempts}${x.guard.ok ? "" : " NG=" + JSON.stringify(x.guard.failures)}`);
    console.log(`     ${x.text}`);
  }
}
