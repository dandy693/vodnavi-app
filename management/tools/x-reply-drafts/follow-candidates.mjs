#!/usr/bin/env node
// 基盤D（フォロー営業）— 候補の絞り込みと follows.json への記録
//
// CSO 指示 2026-09-24:
//   「毎回の抽出後に、当日リプした対象投稿に『いいね』または『返信』している一般ユーザー
//    （メーカー・女優・他アフィリエイター・自動投稿を除く）を読み取り専用で 5〜10 件拾い、
//    ハンドルと根拠（どの投稿への反応か）を提示。HUMAN が 1 日 10 件までフォローする
//    （CTO はフォローしない）。フォロー中が 300 を超えたら一旦停止し、フォロワー比率を見て
//    再開を裁定。x_targets とは別に follows.json（日付・ハンドル・根拠）を management 配下で記録。」
//
// 【厳守】CTO はフォローしない（§26-10-1 の読み取り専用・X の書き込みは作業単位の個別許可のみ）。
//   本ツールは「候補の絞り込み」と「HUMAN がフォローした結果の記録」だけを行う。
//
// 使い方:
//   1) 候補の提示（除外・重複排除・上限）
//      node follow-candidates.mjs --candidates cands.tsv --targets state/<日付>/targets.json \
//        [--follows management/_metrics/x-follows/follows.json] [--max 10] [--json out.json]
//      cands.tsv = 「@ハンドル <TAB> 根拠」（1 行 1 件。根拠＝どの投稿へのどの反応か）
//   2) HUMAN がフォローした分の記録
//      node follow-candidates.mjs --record followed.tsv --date 2026-09-24 \
//        [--follows …] [--json out.json]
//      followed.tsv = 「@ハンドル <TAB> 根拠」（提示のうち実際にフォローした行）
//   3) 状況の表示（累計・推定フォロー中・上限までの残り）
//      node follow-candidates.mjs --status [--follows …]

import fs from "node:fs";
import path from "node:path";

const TAB = String.fromCharCode(9);

/** フォロー中の起点（HUMAN 実測 2026-09-24）。推定値の基準であり、正は画面実測。 */
export const FOLLOWING_BASELINE = { date: "2026-09-24", following: 156, followers: 13 };

/** CSO 指示の上限 */
export const LIMITS = { perDay: 10, followingStop: 300 };

/** 自アカウント（候補から必ず除く） */
const SELF_HANDLES = new Set(["vodnavi_jp", "moterist69", "Motelab_jpn"]);

/** 「@ハンドル <TAB> 根拠」形式の行を読む（区切りは TAB / ｜ / |） */
export function parseCandidateLines(text) {
  const out = [];
  const errors = [];
  const lines = String(text ?? "").split("\n");
  const sep = new RegExp("[" + TAB + "｜|]+");
  lines.forEach((raw, i) => {
    const t = raw.replace(/[\r]+$/, "").trim();
    if (!t || t.startsWith("#")) return;
    const cols = t.split(sep).map((x) => x.trim()).filter(Boolean);
    const handleRaw = cols.find((c) => c.startsWith("@")) || cols[0] || "";
    const handle = handleRaw.replace(/^@/, "");
    const reason = cols.filter((c) => c !== handleRaw).join(" ").trim();
    if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
      errors.push({ lineNo: i + 1, reason: "ハンドルの形式が不正: " + (handleRaw || "(空)") });
      return;
    }
    if (!reason) {
      errors.push({ lineNo: i + 1, handle, reason: "根拠が空（どの投稿へのどの反応かを書く）" });
      return;
    }
    out.push({ handle, reason });
  });
  return { items: out, errors };
}

/** follows.json を読む（無ければ初期構造） */
export function loadFollows(file) {
  if (!file || !fs.existsSync(file)) {
    return { baseline: FOLLOWING_BASELINE, limits: LIMITS, entries: [] };
  }
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    baseline: j.baseline ?? FOLLOWING_BASELINE,
    limits: j.limits ?? LIMITS,
    entries: Array.isArray(j.entries) ? j.entries : [],
  };
}

/** x_targets の読み戻し（active-targets と同じ形）からハンドル集合を作る */
export function targetHandles(targetsJson) {
  const recs = Array.isArray(targetsJson?.records) ? targetsJson.records : [];
  const set = new Set();
  for (const r of recs) {
    const f = r.cellValuesByFieldId ?? r.fields ?? {};
    // handle は primary（fldaWVD2Hs0AeWURb）。フィールド名形でも拾う。
    const h = f["fldaWVD2Hs0AeWURb"] ?? f.handle ?? null;
    if (typeof h === "string" && h.trim()) set.add(h.trim().replace(/^@/, ""));
  }
  return set;
}

/**
 * 候補を絞り込む。純関数。
 * 除外理由は行ごとに残す（提示時に「なぜ落としたか」を報告できるようにする）。
 */
export function selectCandidates(items, { targets = new Set(), follows = [], max = LIMITS.perDay, date = null } = {}) {
  const followed = new Set(follows.map((e) => String(e.handle || "").replace(/^@/, "")));
  const todayCount = date ? follows.filter((e) => e.date === date).length : 0;
  const remaining = Math.max(0, max - todayCount);

  const picked = [];
  const skipped = [];
  const seen = new Set();

  for (const it of items) {
    const h = it.handle;
    if (SELF_HANDLES.has(h)) { skipped.push({ ...it, why: "自アカウント" }); continue; }
    if (targets.has(h)) { skipped.push({ ...it, why: "x_targets に登録済み（営業対象＝一般ユーザーではない）" }); continue; }
    if (followed.has(h)) { skipped.push({ ...it, why: "follows.json に既存（フォロー済み）" }); continue; }
    if (seen.has(h)) { skipped.push({ ...it, why: "同一バッチ内の重複" }); continue; }
    seen.add(h);
    if (picked.length >= remaining) { skipped.push({ ...it, why: "本日の上限（" + max + " 件）に達したため次回へ" }); continue; }
    picked.push(it);
  }
  return { picked, skipped, todayCount, remaining };
}

/** 推定フォロー中（正は画面実測）。 */
export function estimateFollowing(follows) {
  const base = follows.baseline?.following ?? FOLLOWING_BASELINE.following;
  const added = follows.entries.length;
  const est = base + added;
  const stop = follows.limits?.followingStop ?? LIMITS.followingStop;
  return { baseline: base, added, estimated: est, stop, remainingToStop: stop - est, reached: est >= stop };
}

/** follows.json へ追記（重複は弾く）。純関数側は merge のみ。 */
export function mergeFollows(follows, date, items) {
  const existing = new Set(follows.entries.map((e) => String(e.handle || "").replace(/^@/, "")));
  const added = [];
  const dup = [];
  for (const it of items) {
    if (existing.has(it.handle)) { dup.push(it); continue; }
    existing.add(it.handle);
    added.push({ date, handle: it.handle, reason: it.reason });
  }
  return { follows: { ...follows, entries: [...follows.entries, ...added] }, added, dup };
}

function jstDate() {
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}
function jstNow() {
  return new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19) + " JST";
}

function printStatus(follows) {
  const est = estimateFollowing(follows);
  process.stdout.write(
    "[follow] 累計記録 " + follows.entries.length + " 件 / 推定フォロー中 " + est.estimated +
    "（起点 " + est.baseline + "＋追加 " + est.added + "）/ 停止閾値 " + est.stop +
    " まで残り " + est.remainingToStop + "\n"
  );
  if (est.reached) {
    process.stdout.write("🔴 推定フォロー中が停止閾値に達している。**一旦停止し、フォロワー比率を見て再開を CSO が裁定する**（CSO 指示 2026-09-24）\n");
  }
  process.stdout.write("  ※推定値。**正は X 画面の実測**（フォロワー数・フォロー中は HUMAN が木曜に報告する）\n");
}

async function main() {
  const argv = process.argv.slice(2);
  let candFile = null, recordFile = null, targetsFile = null, outJson = null;
  let followsFile = "management/_metrics/x-follows/follows.json";
  let max = LIMITS.perDay;
  let date = jstDate();
  let statusOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--candidates") { candFile = argv[++i]; continue; }
    if (a === "--record") { recordFile = argv[++i]; continue; }
    if (a === "--targets") { targetsFile = argv[++i]; continue; }
    if (a === "--follows") { followsFile = argv[++i]; continue; }
    if (a === "--json") { outJson = argv[++i]; continue; }
    if (a === "--max") { max = Number(argv[++i]) || LIMITS.perDay; continue; }
    if (a === "--date") { date = argv[++i]; continue; }
    if (a === "--status") { statusOnly = true; continue; }
  }

  const follows = loadFollows(followsFile);

  if (statusOnly) { printStatus(follows); return; }

  if (recordFile) {
    const { items, errors } = parseCandidateLines(fs.readFileSync(recordFile, "utf8"));
    for (const e of errors) process.stdout.write("  L" + e.lineNo + " 不正: " + e.reason + "\n");
    const res = mergeFollows(follows, date, items);
    fs.mkdirSync(path.dirname(followsFile), { recursive: true });
    fs.writeFileSync(followsFile, JSON.stringify(res.follows, null, 1) + "\n");
    // §10 読み戻し
    const after = loadFollows(followsFile);
    const ok = after.entries.length === res.follows.entries.length;
    process.stdout.write("[follow] --record " + followsFile + "\n");
    for (const a of res.added) process.stdout.write("  + @" + a.handle + TAB + a.reason + "\n");
    for (const d of res.dup) process.stdout.write("  = @" + d.handle + " skip: 既存\n");
    process.stdout.write("  読み戻し: " + (ok ? "一致" : "🔴不一致") + "（追加 " + res.added.length + " / 既存 " + res.dup.length + " / 累計 " + after.entries.length + "）\n");
    printStatus(after);
    if (outJson) fs.writeFileSync(outJson, JSON.stringify({ recordedAtJst: jstNow(), date, added: res.added, dup: res.dup, status: estimateFollowing(after) }, null, 1));
    return;
  }

  if (!candFile) {
    process.stderr.write("usage: node follow-candidates.mjs --candidates cands.tsv --targets targets.json [--follows f.json] [--max 10] [--json out.json]\n       node follow-candidates.mjs --record followed.tsv --date YYYY-MM-DD\n       node follow-candidates.mjs --status\n");
    process.exit(2);
  }

  const { items, errors } = parseCandidateLines(fs.readFileSync(candFile, "utf8"));
  const targets = targetsFile ? targetHandles(JSON.parse(fs.readFileSync(targetsFile, "utf8"))) : new Set();
  if (!targetsFile) process.stdout.write("⚠ --targets を渡していないため x_targets の除外が効いていない\n");
  const sel = selectCandidates(items, { targets, follows: follows.entries, max, date });

  for (const e of errors) process.stdout.write("  L" + e.lineNo + " 不正: " + e.reason + "\n");
  process.stdout.write("\n=== 提示（HUMAN が 1 日 " + max + " 件までフォロー・CTO はフォローしない）===\n");
  if (sel.picked.length === 0) process.stdout.write("  （候補なし）\n");
  for (const p of sel.picked) process.stdout.write("  @" + p.handle + TAB + p.reason + "\n");
  if (sel.skipped.length) {
    process.stdout.write("\n--- 除外 " + sel.skipped.length + " 件 ---\n");
    for (const s of sel.skipped) process.stdout.write("  @" + s.handle + " … " + s.why + "\n");
  }
  process.stdout.write("\n本日の記録済み " + sel.todayCount + " 件 / 残り枠 " + sel.remaining + " 件\n");
  printStatus(follows);

  if (outJson) {
    fs.writeFileSync(outJson, JSON.stringify({ generatedAtJst: jstNow(), date, max, picked: sel.picked, skipped: sel.skipped, errors, status: estimateFollowing(follows) }, null, 1));
    process.stdout.write("\n[follow] wrote " + outJson + "\n");
  }
}

if (process.argv[1] && process.argv[1].endsWith("follow-candidates.mjs")) {
  main().catch((e) => { process.stderr.write(String((e && e.stack) || e) + "\n"); process.exit(1); });
}
