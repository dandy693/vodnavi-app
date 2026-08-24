/**
 * T3（セール速報）の自動投稿フロー（第99便 タスクA / CSO裁定(1) 案α＝Vercel cron 内）。
 *
 * **【厳守】初期値は OFF。`T3_AUTO_POST_ENABLED` に `1` / `true` を明示しない限り何も書かない。**
 * **稼働の ON は CSO の最終確認後**であり、本モジュールの存在は稼働を意味しない。
 *
 * **【稼働の先行条件・CSO裁定(1)】**
 *   1. **Make.com のフィルタ修正の完了**（§13-3・現状の実測は `management/_metrics/2026-W34/`
 *      `verify-20260823-2230-bin99h-make-filter.md` を参照。**2026-08-23 時点で未修正**）
 *   2. **専用 PAT（posts のみ・Sensitive ON）の発行と配置**（CSO 作業）
 *
 * 【設計原則】**迷ったら書かない。** T3 を1件落として失うのは1投稿だが、
 * 誤った投稿は配信後に取り消せない（削除しても配信された事実は残る）。
 */
import {
  createPost,
  FIELD,
  FIELD_NAME_ERROR_DETAIL,
  getPostByName,
  listStaleApproved,
  markExpired,
  STATUS_ERROR,
  getPost,
  isAirtableConfigured,
  listRecentPosts,
  plain,
  STATUS_APPROVED,
  TYPE_T3,
  type AirtableRecord,
} from "./airtable";
// ガードと生成は `scripts/x-post-generator.mjs`（依存ゼロの ESM）を単一の正とする。
// **同じロジックを src 側に写さない**——写した瞬間に二重管理になり、片方だけ直る。
import {
  buildT3,
  jstString,
  runGuardsAsync,
} from "../../../scripts/x-post-generator.mjs";

/** `VODNAVI_NEW_CAMPAIGN` の1件ぶん（cron の検知結果と同じ形）。 */
export interface T3Material {
  campaign_title: string;
  items: number;
  ends_at: string;
  max_discount: number | null;
  samples: { content_id: string; floor_code: string; price: number | null; list_price: number | null }[];
}

export interface T3AutoResult {
  /** 何もしなかった理由（`null` なら書き込みまで到達した）。 */
  skipped: string | null;
  /** ガード違反。**1件でもあれば書き込んでいない。** */
  failures: { post?: string; guard: string; ng: string | null }[];
  /** 書き込めた場合のレコード ID。 */
  recordId: string | null;
  /** 読み戻し検算の結果（6項目）。 */
  verify: { item: string; ok: boolean; detail: string }[];
  /** 予約した JST 時刻。 */
  scheduledJst: string | null;
}

/**
 * env の真偽フラグを読む。**`"1"` と `"true"`（大文字小文字を問わない）を受ける。**
 * **それ以外はすべて false**——未設定・空文字・`"0"`・`"false"`・タイプミスは
 * **すべて OFF に倒れる**（既定は OFF という契約を崩さない）。
 *
 * 【なぜ両方受けるか・2026-08-24 第102便】**旧実装は `=== "1"` だけを見ていた。**
 * 第102便の指示は `T3_AUTO_POST_ENABLED=true` を設定するよう求めており、
 * **そのまま設定すると両フラグとも OFF のままになる**——**ログ上は
 * `enabled:false` と出るだけで、設定した側からは「入れたのに動かない」
 * 理由が分からない静かな失敗になる。**
 * **値を勝手に `1` へ読み替えるのではなく、受け口を広げて曖昧さを消す。**
 */
function envFlag(raw: string | undefined): boolean {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true";
}

/** 自動投稿の稼働フラグ。**既定は OFF。** */
export function isT3AutoPostEnabled(): boolean {
  return envFlag(process.env.T3_AUTO_POST_ENABLED);
}

/**
 * 配信枠の候補（JST）。**`g8` の 21:00〜23:00 の内側**。
 * 既存の運用枠（21:00 / 22:30）を避け、**空いている枠を前から取る**。
 * **どれも埋まっていれば書かない**——枠を無理に作らない。
 */
const SLOT_CANDIDATES_JST = ["22:00", "21:30", "23:00"] as const;

/** `YYYY-MM-DD` + `HH:mm`（JST）→ UTC の ISO（Z 終端）。 */
export function jstToUtcZ(jstDate: string, hhmm: string): string {
  const d = new Date(`${jstDate}T${hhmm}:00+09:00`);
  return d.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

/** JST の `YYYY-MM-DD`。 */
function jstDateOf(now: Date): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Airtable の行を、ガードが読める形へ均す。 */
function toGuardPost(rec: AirtableRecord): Record<string, unknown> {
  const f = rec.fields;
  return {
    id: rec.id,
    name: (f[FIELD.name] as string) ?? rec.id,
    text: (f[FIELD.text] as string) ?? "",
    linkUrl: (f[FIELD.linkUrl] as string) ?? null,
    type: plain(f[FIELD.type]),
    status: plain(f[FIELD.status]),
    scheduledUtc: (f[FIELD.scheduledUtc] as string) ?? null,
    postId: (f[FIELD.postId] as string) ?? null,
  };
}

/**
 * 検知された新規キャンペーン1件を T3 として投稿予約する。
 *
 * **戻り値の `skipped` が非 null なら、Airtable には一切書いていない。**
 */
export async function autoPostT3(
  material: T3Material,
  now: Date,
  fetchImpl: typeof fetch = fetch,
): Promise<T3AutoResult> {
  const empty: T3AutoResult = {
    skipped: null, failures: [], recordId: null, verify: [], scheduledJst: null,
  };

  // ── 0. 稼働フラグと資格情報 ──────────────────────────────
  if (!isT3AutoPostEnabled()) {
    return { ...empty, skipped: "T3_AUTO_POST_ENABLED が 1 / true でない（既定は OFF）" };
  }
  if (!isAirtableConfigured()) {
    return { ...empty, skipped: "AIRTABLE_POSTS_PAT が未設定" };
  }

  // ── 1. 既存行の読み込み ─────────────────────────────────
  // **取れなければ書かない。** `g18`（1日1件）と `g21`（同名の再報告）は
  // 既存行が無いと判定できず、**判定できないまま書くと重複・上限超過を検出できない**。
  let existing: Record<string, unknown>[];
  try {
    const since = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString();
    existing = (await listRecentPosts(since, fetchImpl)).map(toGuardPost);
  } catch (e) {
    return {
      ...empty,
      skipped: `既存行を取得できなかったため書き込まない: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  // ── 2. 空いている配信枠を選ぶ ───────────────────────────
  const jstDate = jstDateOf(now);
  const usedJst = new Set(
    existing
      .map((p) => (p.scheduledUtc ? jstString(p.scheduledUtc as string) : null))
      .filter((x): x is string => Boolean(x)),
  );
  const slot = SLOT_CANDIDATES_JST.find((hhmm) => !usedJst.has(`${jstDate} ${hhmm}`));
  if (!slot) {
    return { ...empty, skipped: `${jstDate} の候補枠（${SLOT_CANDIDATES_JST.join(" / ")}）がすべて埋まっている` };
  }
  const scheduledUtc = jstToUtcZ(jstDate, slot);
  const intendedJst = `${jstDate} ${slot}`;

  // ── 3. 原稿生成 ─────────────────────────────────────────
  const built = buildT3(material, scheduledUtc);
  if (!built) {
    // **推測で埋めない。** 材料が欠けているなら投稿しない。
    return { ...empty, skipped: "材料が不足しており原稿を生成できなかった", scheduledJst: intendedJst };
  }

  const post = {
    ...built,
    scheduledUtc,
    intendedJst,
    name: `T3 ${material.campaign_title} ${jstDate}`,
  };

  // ── 4. ガード21件（同期20 + g17 リンク先実測） ──────────
  const guarded = await runGuardsAsync([post], existing);
  if (!guarded.pass) {
    // **書き込まない。通知のみ。**
    return { ...empty, failures: guarded.failures, skipped: "ガード違反のため書き込まない", scheduledJst: intendedJst };
  }

  // ── 5. 書き込み ─────────────────────────────────────────
  let created: AirtableRecord;
  try {
    created = await createPost(
      { name: post.name, text: post.text, linkUrl: post.linkUrl, scheduledUtc },
      fetchImpl,
    );
  } catch (e) {
    // **再試行しない。** §10: 失敗の戻り値も着地の否定にならない。
    // **書けている可能性があるため、次回の `g21` / `g18` に判断を委ねる。**
    return {
      ...empty,
      skipped: `書き込みが失敗を返した（着地は未確認・再試行しない）: ${e instanceof Error ? e.message : "unknown"}`,
      scheduledJst: intendedJst,
    };
  }

  // ── 6. 読み戻し検算 6項目（§10） ────────────────────────
  const verify = await verifyWrittenPost(created.id, post, scheduledUtc, existing, fetchImpl);

  return {
    skipped: null,
    failures: [],
    recordId: created.id,
    verify,
    scheduledJst: intendedJst,
  };
}

/**
 * 読み戻し検算（第99便 タスクA(2)）。
 *
 * **【厳守】不一致でも取り消さない。** 既に書かれている可能性があり、
 * **削除すると状態がさらに分からなくなる**。**報告して人が見る。**
 */
export async function verifyWrittenPost(
  recordId: string,
  post: { text: string; linkUrl: string },
  scheduledUtc: string,
  existing: Record<string, unknown>[],
  fetchImpl: typeof fetch = fetch,
): Promise<{ item: string; ok: boolean; detail: string }[]> {
  const out: { item: string; ok: boolean; detail: string }[] = [];
  const add = (item: string, ok: boolean, detail: string) => out.push({ item, ok, detail });

  let rec: AirtableRecord;
  try {
    rec = await getPost(recordId, fetchImpl);
  } catch (e) {
    // **「書けていない」か「読めていない」かは区別できない。断定しない。**
    add("1_レコードの存在", false, `読み戻せなかった（書けていないか読めていないかは区別できない）: ${e instanceof Error ? e.message : "unknown"}`);
    return out;
  }
  add("1_レコードの存在", true, recordId);

  const f = rec.fields;
  const gotText = (f[FIELD.text] as string) ?? "";
  add("2_投稿文の完全一致", gotText === post.text, gotText === post.text ? "一致" : `不一致（長さ ${gotText.length} / 期待 ${post.text.length}）`);

  const gotUrl = (f[FIELD.linkUrl] as string) ?? "";
  add("3_リンクURL", gotUrl === post.linkUrl, gotUrl || "(空)");

  const gotStatus = String(plain(f[FIELD.status]) ?? "");
  add("4_ステータス", gotStatus === STATUS_APPROVED, gotStatus || "(空)");

  const gotSched = (f[FIELD.scheduledUtc] as string) ?? "";
  const zOk = /Z$/.test(gotSched);
  const jstOk = zOk && jstString(gotSched) === jstString(scheduledUtc);
  add(
    "5_予約日時（Z終端 + JST換算の一致）",
    zOk && jstOk,
    `${gotSched || "(空)"} → JST ${zOk ? jstString(gotSched) : "?"}（期待 ${jstString(scheduledUtc)}）`,
  );

  const gotType = String(plain(f[FIELD.type]) ?? "");
  add("5b_タイプ", gotType === TYPE_T3, gotType || "(空)");

  // 6: 読み戻した行そのものでガードを再実行する。
  // **書き込み前と後の両方でガードを通す**（既存の契約と同じ考え方）。
  const reread = {
    ...toGuardPost(rec),
    kind: "T3",
    // 本文から復元させるため material は渡さない——**復元経路そのものを検証する。**
  };
  try {
    const again = await runGuardsAsync([reread], existing);
    // g19 / g20 / g21 は material を要求するため、material 無しでは NG になりうる。
    // **ここで見たいのは「書かれた行が g14 / g8 / g9 / g7 / g13 / g2 を満たすか」**なので、
    // material 依存の3件は除いて評価する。
    const materialDependent = new Set(["g19_t3_deadline", "g20_t3_template", "g21_t3_not_reported"]);
    const relevant = again.failures.filter((x: { guard: string }) => !materialDependent.has(x.guard));
    add(
      "6_読み戻した行でガード再実行（material 非依存分）",
      relevant.length === 0,
      relevant.length === 0 ? "PASS" : JSON.stringify(relevant),
    );
  } catch (e) {
    add("6_読み戻した行でガード再実行（material 非依存分）", false, `実行できなかった: ${e instanceof Error ? e.message : "unknown"}`);
  }

  return out;
}

// ─────────────── 掃除処理（第101便 タスクB）───────────────

/**
 * 掃除の対象とみなすまでの猶予（分）。
 *
 * 【45分の根拠】トリガは **15分間隔**（実行は 20:45〜23:45 JST の1日13回・§13-3）。
 * 45分は **3回ぶんの実行を見送ってなお `承認済` のまま**という状態を指す。
 * 成功例の実配信は予約時刻の **+0.16〜4.21分**（n=9・中央値 約0.7分）なので、
 * **正常な遅れと取り違える余地は無い。**
 */
export const STALE_GRACE_MINUTES = 45;

/**
 * 掃除の**書き込み**を許可するフラグ。**既定は OFF。**
 *
 * 【なぜ検知と書き込みを別のフラグに分けたか・第101便 B(2)】
 * 指示は「**変更前に該当しうる既存レコードの有無を読み戻しで確認し、
 * 既存に影響する場合は変更せず報告**」である。
 * **同じ実行の中で「確認」と「変更」を両方やると、確認の意味が無い。**
 * そこで **検知とログ出力は常に走らせ、書き込みだけを別フラグで塞ぐ**。
 *   1. PAT 配置後の初回 cron … 候補を `VODNAVI_T3_CLEANUP` に出す（**書かない**）
 *   2. CSO が候補を見る       … 既存運用のレコードが混ざっていないか判断する
 *   3. `T3_CLEANUP_ENABLED=1`（または `true`） … 以後は実際に落とす
 *
 * **`T3_AUTO_POST_ENABLED` とは別のフラグである**——掃除は自動投稿が
 * 止まっていても意味を持つ（402 の取り残しは手動運用でも生じる）。
 */
export function isT3CleanupEnabled(): boolean {
  return envFlag(process.env.T3_CLEANUP_ENABLED);
}

export interface CleanupCandidate {
  recordId: string;
  name: string;
  status: string;
  scheduledUtc: string | null;
  scheduledJst: string | null;
  /** 予約日時から現在までの経過（分）。 */
  overdueMinutes: number | null;
  /** 実際に落としたか。 */
  marked: boolean;
  /** 読み戻し検算の結果（落とした場合のみ）。 */
  verify?: { item: string; ok: boolean; detail: string }[];
  error?: string;
}

export interface CleanupResult {
  skipped: string | null;
  /** 書き込みが許可されていたか。 */
  writeEnabled: boolean;
  candidates: CleanupCandidate[];
  cutoffUtc: string | null;
}

/**
 * `承認済` のまま予約時刻を大きく過ぎたレコードを「期限切れ」として落とす。
 *
 * **【厳守】書き込みは `T3_CLEANUP_ENABLED=1` のときだけ。** それ以外は
 * **候補を返すだけで一切書かない。**
 */
export async function cleanupStaleApproved(
  now: Date,
  fetchImpl: typeof fetch = fetch,
): Promise<CleanupResult> {
  const base: CleanupResult = {
    skipped: null, writeEnabled: isT3CleanupEnabled(), candidates: [], cutoffUtc: null,
  };
  if (!isAirtableConfigured()) {
    return { ...base, skipped: "AIRTABLE_POSTS_PAT が未設定" };
  }

  const cutoff = new Date(now.getTime() - STALE_GRACE_MINUTES * 60 * 1000);
  const cutoffUtc = cutoff.toISOString();

  let stale;
  try {
    stale = await listStaleApproved(cutoffUtc, fetchImpl);
  } catch (e) {
    return { ...base, cutoffUtc, skipped: `候補を取得できなかった: ${e instanceof Error ? e.message : "unknown"}` };
  }

  const candidates: CleanupCandidate[] = [];
  for (const rec of stale) {
    const f = rec.fields;
    const scheduledUtc = (f[FIELD.scheduledUtc] as string) ?? null;
    const overdueMinutes = scheduledUtc
      ? Math.round((now.getTime() - new Date(scheduledUtc).getTime()) / 60000)
      : null;
    const c: CleanupCandidate = {
      recordId: rec.id,
      name: (f[FIELD.name] as string) ?? rec.id,
      status: String(plain(f[FIELD.status]) ?? ""),
      scheduledUtc,
      scheduledJst: scheduledUtc ? jstString(scheduledUtc) : null,
      overdueMinutes,
      marked: false,
    };

    if (!base.writeEnabled) {
      // **書かない。** 候補として返すだけ。
      candidates.push(c);
      continue;
    }

    const detail =
      `期限切れ（自動掃除）: 予約 ${c.scheduledJst ?? "?"} JST から ` +
      `${overdueMinutes ?? "?"}分経過しても 承認済 のままだったため配信対象から外した。` +
      `X への配信は行われていない。`;
    try {
      await markExpired(rec.id, detail, fetchImpl);
      c.marked = true;
      c.verify = await verifyExpired(rec.id, detail, fetchImpl);
    } catch (e) {
      // **再試行しない**（§10: 失敗の戻り値も着地の否定にならない）。
      // **取り消しもしない。** 次回の実行で再度候補に上がる。
      c.error = e instanceof Error ? e.message : "unknown";
    }
    candidates.push(c);
  }

  return { ...base, cutoffUtc, candidates };
}

/**
 * 掃除の読み戻し検算（§10・第101便 B(3)）。
 * **不一致でも取り消さない。** 報告して人が見る。
 */
export async function verifyExpired(
  recordId: string,
  expectedDetail: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ item: string; ok: boolean; detail: string }[]> {
  const out: { item: string; ok: boolean; detail: string }[] = [];
  let rec;
  try {
    // **列名キーで読む**（`markExpired` が列名で書いているため揃える）。
    rec = await getPostByName(recordId, fetchImpl);
  } catch (e) {
    out.push({
      item: "1_レコードの読み戻し", ok: false,
      detail: `読めなかった（書けていないか読めていないかは区別できない）: ${e instanceof Error ? e.message : "unknown"}`,
    });
    return out;
  }
  const f = rec.fields;
  const gotStatus = String(plain(f["ステータス"]) ?? "");
  const gotDetail = String(f[FIELD_NAME_ERROR_DETAIL] ?? "");
  const gotSched = f["予約日時"];

  out.push({ item: "1_レコードの読み戻し", ok: true, detail: recordId });
  out.push({ item: "2_ステータス", ok: gotStatus === STATUS_ERROR, detail: gotStatus || "(空)" });
  out.push({ item: "3_エラー詳細", ok: gotDetail === expectedDetail, detail: gotDetail ? "一致" : "(空)" });
  // **予約日時を消していないこと**を確認する（いつの枠だったかを残す）。
  out.push({ item: "4_予約日時が保持されている", ok: Boolean(gotSched), detail: String(gotSched ?? "(空)") });
  return out;
}
